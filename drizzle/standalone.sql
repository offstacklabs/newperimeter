-- Standalone PostgreSQL schema for DATABASE_URL deployments.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public."user" (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  image text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.session (
  id uuid PRIMARY KEY,
  "expiresAt" timestamptz NOT NULL,
  token text NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" uuid NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS session_user_id_idx ON public.session("userId");

CREATE TABLE IF NOT EXISTS public.account (
  id uuid PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" uuid NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS account_user_id_idx ON public.account("userId");

CREATE TABLE IF NOT EXISTS public.verification (
  id uuid PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS verification_identifier_idx ON public.verification(identifier);

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES public."user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  default_action text NOT NULL DEFAULT 'block' CHECK (default_action IN ('allow', 'block', 'flag')),
  audit_retention_days integer NOT NULL DEFAULT 90 CHECK (audit_retention_days BETWEEN 7 AND 3650),
  alert_webhook_url text CHECK (alert_webhook_url IS NULL OR alert_webhook_url ~ '^https://'),
  alert_on text NOT NULL DEFAULT 'block' CHECK (alert_on IN ('block', 'flag_block'))
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);
CREATE INDEX IF NOT EXISTS workspace_members_user_idx ON public.workspace_members(user_id);

CREATE TABLE IF NOT EXISTS public.mcp_servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  version text NOT NULL DEFAULT '1.0.0',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'blocked')),
  created_by uuid REFERENCES public."user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mcp_servers_workspace_idx ON public.mcp_servers(workspace_id);

CREATE TABLE IF NOT EXISTS public.policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  tool_pattern text NOT NULL,
  effect text NOT NULL DEFAULT 'allow' CHECK (effect IN ('allow', 'block', 'flag')),
  scope text NOT NULL DEFAULT 'all teams',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS policies_workspace_idx ON public.policies(workspace_id);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  actor text NOT NULL,
  tool text NOT NULL,
  server text NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('allow', 'block', 'flag')),
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_workspace_time_idx ON public.audit_logs(workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.workspace_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  created_by uuid REFERENCES public."user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS workspace_api_keys_ws_idx ON public.workspace_api_keys(workspace_id);

CREATE TABLE IF NOT EXISTS public.workspace_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'viewer',
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  invited_by uuid REFERENCES public."user"(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  accepted_at timestamptz,
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS workspace_invitations_ws_idx ON public.workspace_invitations(workspace_id);

CREATE OR REPLACE FUNCTION public.is_workspace_member(_ws uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members WHERE workspace_id = _ws AND user_id = _user
  )
$$;

CREATE OR REPLACE FUNCTION public.has_workspace_role(_ws uuid, _user uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _ws AND user_id = _user AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_invitation(_token text)
RETURNS TABLE(workspace_name text, email text, role public.app_role, status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT w.name, i.email, i.role,
    CASE WHEN i.accepted_at IS NOT NULL THEN 'accepted'
         WHEN i.revoked_at IS NOT NULL THEN 'revoked'
         WHEN i.expires_at < now() THEN 'expired'
         ELSE 'pending' END
  FROM public.workspace_invitations i
  JOIN public.workspaces w ON w.id = i.workspace_id
  WHERE i.token = _token
$$;

CREATE OR REPLACE FUNCTION public.accept_invitation(_token text, _user uuid, _signed_in_email text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv public.workspace_invitations;
BEGIN
  IF _user IS NULL OR _signed_in_email IS NULL THEN
    RAISE EXCEPTION 'Sign in to accept this invitation';
  END IF;
  SELECT * INTO inv FROM public.workspace_invitations WHERE token = _token FOR UPDATE;
  IF inv.id IS NULL THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF inv.accepted_at IS NOT NULL THEN RAISE EXCEPTION 'Invitation already used'; END IF;
  IF inv.revoked_at IS NOT NULL THEN RAISE EXCEPTION 'Invitation was revoked'; END IF;
  IF inv.expires_at < now() THEN RAISE EXCEPTION 'Invitation has expired'; END IF;
  IF lower(trim(_signed_in_email)) <> lower(trim(inv.email)) THEN
    RAISE EXCEPTION 'This invitation was sent to %. Sign in with that email.', inv.email;
  END IF;
  INSERT INTO public.workspace_members(workspace_id, user_id, role)
  VALUES (inv.workspace_id, _user, inv.role)
  ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = excluded.role;
  UPDATE public.workspace_invitations SET accepted_at = now() WHERE id = inv.id;
  RETURN inv.workspace_id;
END
$$;

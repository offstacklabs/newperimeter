CREATE TYPE public.app_role AS ENUM ('admin', 'viewer');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_member(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id)
$$;

CREATE POLICY "Users read own roles, admins read all" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins remove roles of others" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin') AND user_id <> auth.uid());

-- First signed-in user becomes admin when no admin exists yet
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  PERFORM pg_advisory_xact_lock(424242);
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin') ON CONFLICT DO NOTHING;
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.grant_role_by_email(_email text, _role public.app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Only admins can grant access'; END IF;
  SELECT id INTO _uid FROM auth.users WHERE lower(email) = lower(trim(_email));
  IF _uid IS NULL THEN RAISE EXCEPTION 'No account with that email. Ask them to sign up first.'; END IF;
  DELETE FROM public.user_roles WHERE user_id = _uid AND _uid <> auth.uid();
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, _role) ON CONFLICT DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.list_members()
RETURNS TABLE (user_id uuid, email text, role public.app_role, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Only admins can list members'; END IF;
  RETURN QUERY SELECT r.user_id, u.email::text, r.role, r.created_at
    FROM public.user_roles r JOIN auth.users u ON u.id = r.user_id ORDER BY r.created_at;
END $$;

REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.grant_role_by_email(text, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.list_members() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_role_by_email(text, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_members() TO authenticated;

-- Tighten table rules
DROP POLICY IF EXISTS "Authenticated users can delete servers" ON public.mcp_servers;
DROP POLICY IF EXISTS "Authenticated users can insert servers" ON public.mcp_servers;
DROP POLICY IF EXISTS "Authenticated users can read servers" ON public.mcp_servers;
DROP POLICY IF EXISTS "Authenticated users can update servers" ON public.mcp_servers;
CREATE POLICY "Members read servers" ON public.mcp_servers FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
CREATE POLICY "Admins insert servers" ON public.mcp_servers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update servers" ON public.mcp_servers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete servers" ON public.mcp_servers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can delete policies" ON public.policies;
DROP POLICY IF EXISTS "Authenticated users can insert policies" ON public.policies;
DROP POLICY IF EXISTS "Authenticated users can read policies" ON public.policies;
DROP POLICY IF EXISTS "Authenticated users can update policies" ON public.policies;
CREATE POLICY "Members read policies" ON public.policies FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
CREATE POLICY "Admins insert policies" ON public.policies FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update policies" ON public.policies FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete policies" ON public.policies FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can read audit logs" ON public.audit_logs;
CREATE POLICY "Members read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_member(auth.uid()));
CREATE POLICY "Admins insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
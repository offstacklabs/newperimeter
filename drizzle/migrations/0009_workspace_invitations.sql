CREATE TABLE public.workspace_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'viewer',
  token text NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(24), 'hex'),
  invited_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  accepted_at timestamptz,
  revoked_at timestamptz
);
CREATE INDEX ON public.workspace_invitations(workspace_id);
GRANT SELECT, INSERT, UPDATE ON public.workspace_invitations TO authenticated;
GRANT ALL ON public.workspace_invitations TO service_role;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read invites" ON public.workspace_invitations FOR SELECT TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), 'admin'));
CREATE POLICY "Admins create invites" ON public.workspace_invitations FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), 'admin'));
CREATE POLICY "Admins revoke invites" ON public.workspace_invitations FOR UPDATE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), 'admin'))
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.get_invitation(_token text)
RETURNS TABLE(workspace_name text, email text, role public.app_role, status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT w.name, i.email, i.role,
    CASE WHEN i.accepted_at IS NOT NULL THEN 'accepted'
         WHEN i.revoked_at IS NOT NULL THEN 'revoked'
         WHEN i.expires_at < now() THEN 'expired'
         ELSE 'pending' END
  FROM public.workspace_invitations i JOIN public.workspaces w ON w.id = i.workspace_id
  WHERE i.token = _token
$$;

CREATE OR REPLACE FUNCTION public.accept_invitation(_token text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inv public.workspace_invitations; _email text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in to accept this invitation'; END IF;
  SELECT * INTO inv FROM public.workspace_invitations WHERE token = _token FOR UPDATE;
  IF inv.id IS NULL THEN RAISE EXCEPTION 'Invitation not found'; END IF;
  IF inv.accepted_at IS NOT NULL THEN RAISE EXCEPTION 'Invitation already used'; END IF;
  IF inv.revoked_at IS NOT NULL THEN RAISE EXCEPTION 'Invitation was revoked'; END IF;
  IF inv.expires_at < now() THEN RAISE EXCEPTION 'Invitation has expired'; END IF;
  SELECT u.email INTO _email FROM auth.users u WHERE u.id = auth.uid();
  IF lower(_email) <> lower(trim(inv.email)) THEN
    RAISE EXCEPTION 'This invitation was sent to %. Sign in with that email.', inv.email;
  END IF;
  INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES (inv.workspace_id, auth.uid(), inv.role)
    ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = excluded.role;
  UPDATE public.workspace_invitations SET accepted_at = now() WHERE id = inv.id;
  RETURN inv.workspace_id;
END $$;
GRANT EXECUTE ON FUNCTION public.get_invitation(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invitation(text) TO authenticated;
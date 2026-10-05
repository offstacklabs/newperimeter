CREATE TABLE public.workspace_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);
CREATE INDEX workspace_api_keys_ws_idx ON public.workspace_api_keys(workspace_id);
GRANT SELECT, INSERT, UPDATE ON public.workspace_api_keys TO authenticated;
GRANT ALL ON public.workspace_api_keys TO service_role;
ALTER TABLE public.workspace_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read keys" ON public.workspace_api_keys FOR SELECT TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins create keys" ON public.workspace_api_keys FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins revoke keys" ON public.workspace_api_keys FOR UPDATE TO authenticated
  USING (public.has_workspace_role(workspace_id, auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_workspace_role(workspace_id, auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.delete_workspace(_ws uuid)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
begin
  if not public.has_workspace_role(_ws, auth.uid(), 'admin'::app_role) then
    raise exception 'Only workspace admins can delete a workspace';
  end if;
  delete from public.workspace_api_keys where workspace_id = _ws;
  delete from public.audit_logs where workspace_id = _ws;
  delete from public.policies where workspace_id = _ws;
  delete from public.mcp_servers where workspace_id = _ws;
  delete from public.workspace_members where workspace_id = _ws;
  delete from public.workspaces where id = _ws;
end;
$function$;
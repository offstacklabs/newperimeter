-- Workspace settings columns
alter table public.workspaces
  add column default_action text not null default 'block',
  add column audit_retention_days integer not null default 90;

alter table public.workspaces
  add constraint workspaces_default_action_check check (default_action in ('allow','flag','block'));

alter table public.workspaces
  add constraint workspaces_audit_retention_check check (audit_retention_days between 7 and 3650);

-- Admin-only workspace delete (cascades dependents inside a security-definer fn)
create or replace function public.delete_workspace(_ws uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_workspace_role(_ws, auth.uid(), 'admin'::app_role) then
    raise exception 'Only workspace admins can delete a workspace';
  end if;
  delete from public.audit_logs where workspace_id = _ws;
  delete from public.policies where workspace_id = _ws;
  delete from public.mcp_servers where workspace_id = _ws;
  delete from public.workspace_members where workspace_id = _ws;
  delete from public.workspaces where id = _ws;
end;
$$;

revoke execute on function public.delete_workspace(uuid) from anon, public;
grant execute on function public.delete_workspace(uuid) to authenticated;

comment on function public.delete_workspace(uuid) is 'Admin-only: deletes a workspace and all its servers, policies, audit logs and members.';
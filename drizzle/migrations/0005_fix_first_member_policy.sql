drop policy "Admins add members" on public.workspace_members;
create policy "Admins add members" on public.workspace_members
  for insert to authenticated
  with check (
    public.has_workspace_role(workspace_id, auth.uid(), 'admin'::app_role)
    or exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.created_by = auth.uid()
    )
  );
drop policy "Members read workspaces" on public.workspaces;
create policy "Members read workspaces" on public.workspaces
  for select to authenticated
  using (public.is_workspace_member(id, auth.uid()) or created_by = auth.uid());
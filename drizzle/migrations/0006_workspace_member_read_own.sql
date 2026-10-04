drop policy "Members read members" on public.workspace_members;
create policy "Members read members" on public.workspace_members
  for select to authenticated
  using (public.is_workspace_member(workspace_id, auth.uid()) or user_id = auth.uid());
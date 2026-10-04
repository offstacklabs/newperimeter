-- Workspaces: each team gets its own servers, policies, audit log and members
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.workspaces to authenticated;
grant all on public.workspaces to service_role;
alter table public.workspaces enable row level security;

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null,
  role app_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);
grant select, insert, update, delete on public.workspace_members to authenticated;
grant all on public.workspace_members to service_role;
alter table public.workspace_members enable row level security;

create index workspace_members_user_idx on public.workspace_members(user_id);

-- Helpers (security definer so policies don't recurse)
create or replace function public.is_workspace_member(_ws uuid, _user uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.workspace_members where workspace_id = _ws and user_id = _user)
$$;

create or replace function public.has_workspace_role(_ws uuid, _user uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.workspace_members where workspace_id = _ws and user_id = _user and role = _role)
$$;

-- Backfill: one default workspace holding all existing data, memberships carried over from user_roles
insert into public.workspaces (name) values ('Main workspace');

alter table public.mcp_servers add column workspace_id uuid references public.workspaces(id);
alter table public.policies add column workspace_id uuid references public.workspaces(id);
alter table public.audit_logs add column workspace_id uuid references public.workspaces(id);

create index mcp_servers_workspace_idx on public.mcp_servers(workspace_id);
create index policies_workspace_idx on public.policies(workspace_id);
create index audit_logs_workspace_idx on public.audit_logs(workspace_id);

update public.mcp_servers set workspace_id = (select id from public.workspaces where name = 'Main workspace' limit 1);
update public.policies set workspace_id = (select id from public.workspaces where name = 'Main workspace' limit 1);
update public.audit_logs set workspace_id = (select id from public.workspaces where name = 'Main workspace' limit 1);

insert into public.workspace_members (workspace_id, user_id, role)
select (select id from public.workspaces where name = 'Main workspace' limit 1), user_id, role from public.user_roles;

update public.workspaces set created_by = (
  select user_id from public.workspace_members
  where workspace_id = (select id from public.workspaces where name = 'Main workspace' limit 1) and role = 'admin'
  limit 1
) where name = 'Main workspace';

-- Retire the old global policies on data tables (replaced by workspace-scoped ones below)
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' and tablename in ('mcp_servers','policies','audit_logs')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- Workspaces: anyone can create their own; only members see it; admins manage it
create policy "Users create workspaces" on public.workspaces
  for insert to authenticated with check (true);
create policy "Members read workspaces" on public.workspaces
  for select to authenticated using (public.is_workspace_member(id, auth.uid()));
create policy "Admins update workspaces" on public.workspaces
  for update to authenticated using (public.has_workspace_role(id, auth.uid(), 'admin'));
create policy "Admins delete workspaces" on public.workspaces
  for delete to authenticated using (public.has_workspace_role(id, auth.uid(), 'admin'));

-- Memberships: readable by fellow members; admins manage; workspace creators can add themselves as first admin
create policy "Members read members" on public.workspace_members
  for select to authenticated using (public.is_workspace_member(workspace_id, auth.uid()));
create policy "Admins add members" on public.workspace_members
  for insert to authenticated with check (
    public.has_workspace_role(workspace_id, auth.uid(), 'admin')
    or exists (select 1 from public.workspaces w where w.id = workspace_id and w.created_by = auth.uid())
  );
create policy "Admins update members" on public.workspace_members
  for update to authenticated using (public.has_workspace_role(workspace_id, auth.uid(), 'admin'));
create policy "Admins remove members" on public.workspace_members
  for delete to authenticated using (public.has_workspace_role(workspace_id, auth.uid(), 'admin') and user_id <> auth.uid());

-- Data tables: reads for members, writes for admins, all scoped to the workspace
create policy "Members read servers" on public.mcp_servers
  for select to authenticated using (public.is_workspace_member(workspace_id, auth.uid()));
create policy "Admins insert servers" on public.mcp_servers
  for insert to authenticated with check (public.has_workspace_role(workspace_id, auth.uid(), 'admin'));
create policy "Admins update servers" on public.mcp_servers
  for update to authenticated using (public.has_workspace_role(workspace_id, auth.uid(), 'admin')) with check (public.has_workspace_role(workspace_id, auth.uid(), 'admin'));
create policy "Admins delete servers" on public.mcp_servers
  for delete to authenticated using (public.has_workspace_role(workspace_id, auth.uid(), 'admin'));

create policy "Members read policies" on public.policies
  for select to authenticated using (public.is_workspace_member(workspace_id, auth.uid()));
create policy "Admins insert policies" on public.policies
  for insert to authenticated with check (public.has_workspace_role(workspace_id, auth.uid(), 'admin'));
create policy "Admins update policies" on public.policies
  for update to authenticated using (public.has_workspace_role(workspace_id, auth.uid(), 'admin')) with check (public.has_workspace_role(workspace_id, auth.uid(), 'admin'));
create policy "Admins delete policies" on public.policies
  for delete to authenticated using (public.has_workspace_role(workspace_id, auth.uid(), 'admin'));

create policy "Members read audit logs" on public.audit_logs
  for select to authenticated using (public.is_workspace_member(workspace_id, auth.uid()));
create policy "Admins insert audit logs" on public.audit_logs
  for insert to authenticated with check (public.has_workspace_role(workspace_id, auth.uid(), 'admin'));

-- Team management helpers (security definer so admins can act without direct table writes)
create or replace function public.invite_to_workspace(_ws uuid, _email text, _role app_role)
returns void
language plpgsql security definer set search_path = public
as $$
declare _uid uuid;
begin
  if not public.has_workspace_role(_ws, auth.uid(), 'admin') then
    raise exception 'Only workspace admins can invite members';
  end if;
  select id into _uid from auth.users where lower(email) = lower(trim(_email));
  if _uid is null then raise exception 'No account with that email. Ask them to sign up first.'; end if;
  insert into public.workspace_members (workspace_id, user_id, role) values (_ws, _uid, _role)
    on conflict (workspace_id, user_id) do update set role = excluded.role;
end $$;

create or replace function public.remove_from_workspace(_ws uuid, _user uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.has_workspace_role(_ws, auth.uid(), 'admin') then
    raise exception 'Only workspace admins can remove members';
  end if;
  if _user = auth.uid() then raise exception 'You cannot remove yourself'; end if;
  delete from public.workspace_members where workspace_id = _ws and user_id = _user;
end $$;

create or replace function public.list_workspace_members(_ws uuid)
returns table(user_id uuid, email text, role app_role, created_at timestamptz)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.is_workspace_member(_ws, auth.uid()) then
    raise exception 'Not a member of this workspace';
  end if;
  return query
    select m.user_id, u.email::text, m.role, m.created_at
    from public.workspace_members m
    join auth.users u on u.id = m.user_id
    where m.workspace_id = _ws
    order by m.created_at;
end $$;

-- user_roles is retired: roles now live per workspace
comment on table public.user_roles is 'DEPRECATED: replaced by workspace_members for per-workspace roles';
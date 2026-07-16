-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- Stage 1: organizations, profiles, tasks tables + RLS + org create/join functions.

create extension if not exists pgcrypto;

-- 1. Organizations
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

-- 2. Profiles (one row per user, created only once they create/join an org)
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references organizations (id) on delete cascade,
  role text not null check (role in ('manager', 'member')),
  created_at timestamptz not null default now()
);

-- 3. Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id) on delete cascade,
  title text not null,
  description text,
  assigned_to uuid references profiles (id),
  assigned_by uuid references profiles (id),
  due_date date,
  status text not null default 'open' check (status in ('open', 'done')),
  created_at timestamptz not null default now()
);

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table tasks enable row level security;

-- Returns the caller's organization_id, bypassing RLS so it can be safely
-- used inside policies without recursive-policy issues.
create or replace function public.current_user_org_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select organization_id from profiles where id = auth.uid()
$$;

grant execute on function public.current_user_org_id() to authenticated;

-- Read-only policies: users can only see rows belonging to their own org.
-- No insert/update policies are defined here (default = denied), so writes
-- must go through the security-definer functions below, or (for tasks)
-- through policies we'll add when we build the task UI.

create policy "select own org" on organizations
  for select to authenticated
  using (id = current_user_org_id());

create policy "select own org profiles" on profiles
  for select to authenticated
  using (organization_id = current_user_org_id());

create policy "select own org tasks" on tasks
  for select to authenticated
  using (organization_id = current_user_org_id());

-- Generates a random 8-character invite code, retrying on collision.
create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  new_code text;
  code_taken boolean;
  attempts int := 0;
begin
  loop
    new_code := upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 8));
    select exists(select 1 from organizations where invite_code = new_code) into code_taken;
    attempts := attempts + 1;
    exit when not code_taken or attempts > 10;
  end loop;

  if code_taken then
    raise exception 'Could not generate a unique invite code, please try again';
  end if;

  return new_code;
end;
$$;

-- Creates a new organization and makes the caller its manager.
create or replace function public.create_organization(org_name text)
returns organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org organizations;
begin
  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'You already belong to an organization';
  end if;

  insert into organizations (name, invite_code)
  values (org_name, generate_invite_code())
  returning * into new_org;

  insert into profiles (id, organization_id, role)
  values (auth.uid(), new_org.id, 'manager');

  return new_org;
end;
$$;

grant execute on function public.create_organization(text) to authenticated;

-- Joins an existing organization by invite code, as a member.
create or replace function public.join_organization(code text)
returns organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org organizations;
begin
  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'You already belong to an organization';
  end if;

  select * into target_org from organizations where invite_code = upper(code);

  if target_org.id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into profiles (id, organization_id, role)
  values (auth.uid(), target_org.id, 'member');

  return target_org;
end;
$$;

grant execute on function public.join_organization(text) to authenticated;

-- Stage 2: task creation/assignment.

-- Add email so the UI can show "who's who" when assigning tasks.
alter table profiles add column if not exists email text;

update profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

alter table profiles alter column email set not null;

create or replace function public.create_organization(org_name text)
returns organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org organizations;
begin
  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'You already belong to an organization';
  end if;

  insert into organizations (name, invite_code)
  values (org_name, generate_invite_code())
  returning * into new_org;

  insert into profiles (id, organization_id, role, email)
  values (auth.uid(), new_org.id, 'manager', (select email from auth.users where id = auth.uid()));

  return new_org;
end;
$$;

create or replace function public.join_organization(code text)
returns organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org organizations;
begin
  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'You already belong to an organization';
  end if;

  select * into target_org from organizations where invite_code = upper(code);

  if target_org.id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into profiles (id, organization_id, role, email)
  values (auth.uid(), target_org.id, 'member', (select email from auth.users where id = auth.uid()));

  return target_org;
end;
$$;

-- Returns the caller's role, for use in RLS policies.
create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from profiles where id = auth.uid()
$$;

grant execute on function public.current_user_role() to authenticated;

-- Managers can create tasks in their own org, assigned by themselves.
create policy "managers insert org tasks" on tasks
  for insert to authenticated
  with check (
    organization_id = current_user_org_id()
    and assigned_by = auth.uid()
    and current_user_role() = 'manager'
  );

-- The assignee or a manager can update a task (e.g. mark done).
-- Note: this allows updating any column, not just status -- our app only
-- ever sends status changes, but this isn't enforced at the column level.
create policy "assignee or manager updates task" on tasks
  for update to authenticated
  using (
    organization_id = current_user_org_id()
    and (assigned_to = auth.uid() or current_user_role() = 'manager')
  )
  with check (
    organization_id = current_user_org_id()
  );

-- Stage 3: task edit/delete + members view.

-- Managers can delete tasks in their own org.
create policy "managers delete org tasks" on tasks
  for delete to authenticated
  using (
    organization_id = current_user_org_id()
    and current_user_role() = 'manager'
  );

-- Stage 4: member management (remove, promote/demote).

-- Removing a member should keep their past tasks, just unassign them,
-- rather than blocking removal or deleting task history.
alter table tasks drop constraint tasks_assigned_to_fkey;
alter table tasks add constraint tasks_assigned_to_fkey
  foreign key (assigned_to) references profiles (id) on delete set null;

alter table tasks drop constraint tasks_assigned_by_fkey;
alter table tasks add constraint tasks_assigned_by_fkey
  foreign key (assigned_by) references profiles (id) on delete set null;

-- Removes a member from the org. Managers only; can't remove yourself;
-- can't remove the last manager (would leave the org unmanageable).
create or replace function public.remove_member(target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid;
  target_role text;
  manager_count int;
begin
  if current_user_role() <> 'manager' then
    raise exception 'Only managers can remove members';
  end if;

  if target_id = auth.uid() then
    raise exception 'You cannot remove yourself';
  end if;

  select organization_id, role into target_org, target_role
  from profiles where id = target_id;

  if target_org is null or target_org <> current_user_org_id() then
    raise exception 'Member not found in your organization';
  end if;

  if target_role = 'manager' then
    select count(*) into manager_count from profiles
    where organization_id = target_org and role = 'manager';

    if manager_count <= 1 then
      raise exception 'Cannot remove the last manager';
    end if;
  end if;

  delete from profiles where id = target_id;
end;
$$;

grant execute on function public.remove_member(uuid) to authenticated;

-- Promotes/demotes a member. Managers only; can't change your own role;
-- can't demote the last manager.
create or replace function public.update_member_role(target_id uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org uuid;
  target_role text;
  manager_count int;
begin
  if new_role not in ('manager', 'member') then
    raise exception 'Invalid role';
  end if;

  if current_user_role() <> 'manager' then
    raise exception 'Only managers can change roles';
  end if;

  if target_id = auth.uid() then
    raise exception 'You cannot change your own role';
  end if;

  select organization_id, role into target_org, target_role
  from profiles where id = target_id;

  if target_org is null or target_org <> current_user_org_id() then
    raise exception 'Member not found in your organization';
  end if;

  if target_role = 'manager' and new_role = 'member' then
    select count(*) into manager_count from profiles
    where organization_id = target_org and role = 'manager';

    if manager_count <= 1 then
      raise exception 'Cannot demote the last manager';
    end if;
  end if;

  update profiles set role = new_role where id = target_id;
end;
$$;

grant execute on function public.update_member_role(uuid, text) to authenticated;

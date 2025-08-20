-- Run in Supabase SQL editor.
-- Adjust schema/table names accordingly.

-- Example membership view (expects a table public.memberships mirrored from app DB if needed)
-- If you store memberships in Postgres directly used by Supabase, create tables here instead.

-- Enable RLS
alter table if exists public.orgs enable row level security;
alter table if exists public.memberships enable row level security;

-- Basic policy: user can see memberships where user_id = auth.uid()
create policy "read_own_memberships"
on public.memberships for select
using (user_id = auth.uid());

-- Helper function to check membership and role
create or replace function public.is_member(p_org uuid, p_min_role text default 'MEMBER')
returns boolean
language sql stable set search_path = ''
as $$
  select exists(
    select 1 from public.memberships m
    where m.org_id = p_org
      and m.user_id = auth.uid()
      and (
        (p_min_role = 'VIEWER')
        or (p_min_role = 'MEMBER' and m.role in ('MEMBER','ADMIN','OWNER'))
        or (p_min_role = 'ADMIN' and m.role in ('ADMIN','OWNER'))
        or (p_min_role = 'OWNER' and m.role = 'OWNER')
      )
  );
$$;

-- Example policy for an org-scoped table (replace 'records' with your table)
-- alter table public.records enable row level security;
-- create policy "org_members_read_records"
-- on public.records for select
-- using (public.is_member(org_id, 'VIEWER'));
-- create policy "org_members_write_records"
-- on public.records for insert with check (public.is_member(org_id, 'MEMBER'));
-- create policy "org_members_update_records"
-- on public.records for update using (public.is_member(org_id, 'MEMBER'));

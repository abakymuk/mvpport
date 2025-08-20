-- Minimal invites table example (if managing invites inside Supabase)
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  email text not null,
  role text not null default 'MEMBER',
  status text not null default 'PENDING', -- PENDING | ACCEPTED | DECLINED | EXPIRED
  token text not null,
  created_at timestamptz not null default now(),
  unique(org_id, email)
);

-- Indexes
create index if not exists invites_org_id_idx on public.invites(org_id);
create index if not exists invites_email_idx on public.invites(email);

-- RLS
alter table public.invites enable row level security;

-- Only members with ADMIN+ can manage invites of their org
create policy "read_invites_admin_plus"
on public.invites for select
using (public.is_member(org_id, 'ADMIN'));

create policy "insert_invites_admin_plus"
on public.invites for insert
with check (public.is_member(org_id, 'ADMIN'));

create policy "update_invites_admin_plus"
on public.invites for update
using (public.is_member(org_id, 'ADMIN'));

-- Accepting invite (example function stub)
create or replace function public.accept_invite(p_token text)
returns void language plpgsql security definer set search_path = 'public' as $$
declare v_invite public.invites;
begin
  select * into v_invite from public.invites where token = p_token and status = 'PENDING';
  if not found then
    raise exception 'Invite not found or already processed';
  end if;
  -- Here you would create membership row for auth.uid() with v_invite.role
  -- update public.invites set status='ACCEPTED' where id=v_invite.id;
end;
$$;

create table if not exists public.practitioner_accounts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  practitioner_id uuid references public.practitioners(id) on delete set null,
  email text not null,
  plan text not null default 'presence',
  contact_slot text not null default 'phone',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint practitioner_accounts_plan_check check (plan in ('presence', 'visibilite_plus')),
  constraint practitioner_accounts_contact_slot_check check (contact_slot in ('phone', 'email', 'booking_url'))
);

create unique index if not exists practitioner_accounts_practitioner_id_uidx
  on public.practitioner_accounts (practitioner_id)
  where practitioner_id is not null;

create index if not exists practitioner_accounts_email_idx
  on public.practitioner_accounts (email);

alter table public.practitioners
  add column if not exists siret text;

create unique index if not exists practitioners_siret_uidx
  on public.practitioners (siret)
  where siret is not null;

create table if not exists public.practitioner_profile_stats (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  date date not null,
  profile_views integer not null default 0,
  contact_clicks integer not null default 0,
  booking_clicks integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint practitioner_profile_stats_non_negative_check check (
    profile_views >= 0 and contact_clicks >= 0 and booking_clicks >= 0
  )
);

create unique index if not exists practitioner_profile_stats_day_uidx
  on public.practitioner_profile_stats (practitioner_id, date);

create index if not exists practitioner_profile_stats_practitioner_date_idx
  on public.practitioner_profile_stats (practitioner_id, date desc);

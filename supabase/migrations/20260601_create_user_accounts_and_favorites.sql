create extension if not exists pgcrypto;

create table if not exists public.user_accounts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  email text not null,
  first_name text null,
  last_name text null,
  avatar_seed text not null default encode(gen_random_bytes(6), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_accounts_email_uidx
  on public.user_accounts (lower(email));

create table if not exists public.user_favorite_practitioners (
  id uuid primary key default gen_random_uuid(),
  user_account_id uuid not null references public.user_accounts(id) on delete cascade,
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_account_id, practitioner_id)
);

create index if not exists user_favorite_practitioners_user_idx
  on public.user_favorite_practitioners (user_account_id, created_at desc);

create index if not exists user_favorite_practitioners_practitioner_idx
  on public.user_favorite_practitioners (practitioner_id);

alter table public.practitioner_reviews
  add column if not exists user_account_id uuid null references public.user_accounts(id) on delete set null;

create index if not exists practitioner_reviews_user_account_idx
  on public.practitioner_reviews (user_account_id, created_at desc)
  where user_account_id is not null;

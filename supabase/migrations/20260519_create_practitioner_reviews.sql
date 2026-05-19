create extension if not exists pgcrypto;

create table if not exists public.practitioner_reviews (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  email text not null,
  rating smallint not null check (rating between 0 and 5),
  message text null,
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  created_at timestamptz not null default now(),
  published_at timestamptz null,
  updated_at timestamptz not null default now()
);

create index if not exists practitioner_reviews_practitioner_id_idx
  on public.practitioner_reviews (practitioner_id);

create index if not exists practitioner_reviews_practitioner_created_at_idx
  on public.practitioner_reviews (practitioner_id, created_at desc);

create index if not exists practitioner_reviews_status_created_at_idx
  on public.practitioner_reviews (status, created_at desc);

alter table public.practitioner_reviews enable row level security;

drop policy if exists "Public can read published reviews" on public.practitioner_reviews;
create policy "Public can read published reviews"
  on public.practitioner_reviews
  for select
  using (status = 'published');

create or replace function public.touch_practitioner_reviews_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_practitioner_reviews_updated_at on public.practitioner_reviews;
create trigger touch_practitioner_reviews_updated_at
before update on public.practitioner_reviews
for each row
execute function public.touch_practitioner_reviews_updated_at();

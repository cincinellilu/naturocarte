create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_name text not null,
  page_path text,
  referrer text,
  device_type text,
  source text,
  session_id text,
  user_account_id uuid references public.user_accounts(id) on delete set null,
  practitioner_account_id uuid references public.practitioner_accounts(id) on delete set null,
  practitioner_id uuid references public.practitioners(id) on delete set null,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  constraint product_events_event_name_check
    check (event_name ~ '^[a-z0-9][a-z0-9_:.:-]{1,79}$'),
  constraint product_events_device_type_check
    check (device_type is null or device_type in ('desktop', 'tablet', 'mobile', 'unknown')),
  constraint product_events_metadata_object_check
    check (jsonb_typeof(metadata) = 'object')
);

create index if not exists product_events_created_at_idx
  on public.product_events (created_at desc);

create index if not exists product_events_event_created_at_idx
  on public.product_events (event_name, created_at desc);

create index if not exists product_events_practitioner_created_at_idx
  on public.product_events (practitioner_id, created_at desc)
  where practitioner_id is not null;

create index if not exists product_events_user_created_at_idx
  on public.product_events (user_account_id, created_at desc)
  where user_account_id is not null;

create index if not exists product_events_practitioner_account_created_at_idx
  on public.product_events (practitioner_account_id, created_at desc)
  where practitioner_account_id is not null;

create index if not exists product_events_page_path_created_at_idx
  on public.product_events (page_path, created_at desc)
  where page_path is not null;

alter table public.product_events enable row level security;

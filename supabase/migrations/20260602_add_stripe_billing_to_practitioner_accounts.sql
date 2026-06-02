alter table public.practitioner_accounts
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_subscription_status text,
  add column if not exists stripe_price_id text,
  add column if not exists stripe_current_period_end timestamptz;

create index if not exists practitioner_accounts_stripe_customer_idx
  on public.practitioner_accounts (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists practitioner_accounts_stripe_subscription_uidx
  on public.practitioner_accounts (stripe_subscription_id)
  where stripe_subscription_id is not null;

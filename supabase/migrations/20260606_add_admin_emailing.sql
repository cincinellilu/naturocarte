create extension if not exists pgcrypto;

create table if not exists public.marketing_email_campaigns (
  id uuid primary key default gen_random_uuid(),
  audience_key text not null,
  audience_label text not null,
  name text not null,
  from_email text not null,
  subject_template text not null,
  html_template text not null,
  text_template text not null default '',
  status text not null default 'draft',
  total_recipients integer not null default 0,
  last_error text null,
  send_started_at timestamptz null,
  send_completed_at timestamptz null,
  sent_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_email_campaigns_status_check
    check (status in ('draft', 'sending', 'sent', 'partially_failed', 'failed'))
);

create index if not exists marketing_email_campaigns_created_at_idx
  on public.marketing_email_campaigns(created_at desc);

create index if not exists marketing_email_campaigns_status_idx
  on public.marketing_email_campaigns(status);

create table if not exists public.marketing_email_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.marketing_email_campaigns(id) on delete cascade,
  practitioner_id uuid null references public.practitioners(id) on delete set null,
  slug text null,
  recipient_email text not null,
  recipient_first_name text null,
  recipient_last_name text null,
  city text null,
  unsubscribe_token text not null,
  provider_email_id text null,
  status text not null default 'pending',
  tags jsonb not null default '{}'::jsonb,
  last_error text null,
  sent_at timestamptz null,
  delivered_at timestamptz null,
  opened_at timestamptz null,
  clicked_at timestamptz null,
  bounced_at timestamptz null,
  complained_at timestamptz null,
  failed_at timestamptz null,
  unsubscribed_at timestamptz null,
  last_event_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_email_recipients_status_check
    check (
      status in (
        'pending',
        'sent',
        'delivered',
        'opened',
        'clicked',
        'delivery_delayed',
        'bounced',
        'complained',
        'failed',
        'suppressed',
        'unsubscribed'
      )
    ),
  constraint marketing_email_recipients_campaign_email_key
    unique (campaign_id, recipient_email),
  constraint marketing_email_recipients_unsubscribe_token_key
    unique (unsubscribe_token)
);

create unique index if not exists marketing_email_recipients_provider_email_id_idx
  on public.marketing_email_recipients(provider_email_id)
  where provider_email_id is not null;

create index if not exists marketing_email_recipients_campaign_id_idx
  on public.marketing_email_recipients(campaign_id);

create index if not exists marketing_email_recipients_practitioner_id_idx
  on public.marketing_email_recipients(practitioner_id);

create index if not exists marketing_email_recipients_status_idx
  on public.marketing_email_recipients(status);

create index if not exists marketing_email_recipients_email_idx
  on public.marketing_email_recipients(recipient_email);

create table if not exists public.marketing_email_events (
  id uuid primary key default gen_random_uuid(),
  svix_id text not null unique,
  campaign_id uuid null references public.marketing_email_campaigns(id) on delete set null,
  recipient_id uuid null references public.marketing_email_recipients(id) on delete set null,
  practitioner_id uuid null references public.practitioners(id) on delete set null,
  provider_email_id text null,
  event_type text not null,
  recipient_email text null,
  link_url text null,
  occurred_at timestamptz not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists marketing_email_events_campaign_id_idx
  on public.marketing_email_events(campaign_id);

create index if not exists marketing_email_events_recipient_id_idx
  on public.marketing_email_events(recipient_id);

create index if not exists marketing_email_events_provider_email_id_idx
  on public.marketing_email_events(provider_email_id);

create index if not exists marketing_email_events_event_type_idx
  on public.marketing_email_events(event_type);

create index if not exists marketing_email_events_occurred_at_idx
  on public.marketing_email_events(occurred_at desc);

create table if not exists public.marketing_email_suppressions (
  email text primary key,
  reason text not null,
  source text not null default 'naturocarte',
  campaign_id uuid null references public.marketing_email_campaigns(id) on delete set null,
  practitioner_id uuid null references public.practitioners(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketing_email_suppressions_reason_check
    check (reason in ('unsubscribed', 'bounced', 'complained', 'manual', 'suppressed'))
);

create index if not exists marketing_email_suppressions_reason_idx
  on public.marketing_email_suppressions(reason);

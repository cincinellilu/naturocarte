create extension if not exists pgcrypto;

create table if not exists public.practitioner_claim_campaign_emails (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null,
  campaign_version text not null,
  subject_variant integer not null,
  recipient_email text not null,
  practitioner_id uuid null references public.practitioners(id) on delete set null,
  tracking_token text not null,
  sent_at timestamptz not null default now(),
  clicked_at timestamptz null,
  claimed_at timestamptz null,
  status text not null default 'sent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint practitioner_claim_campaign_emails_campaign_id_check
    check (campaign_id ~ '^[ABC][1-5]$'),
  constraint practitioner_claim_campaign_emails_version_check
    check (campaign_version in ('A', 'B', 'C')),
  constraint practitioner_claim_campaign_emails_subject_variant_check
    check (subject_variant between 1 and 5),
  constraint practitioner_claim_campaign_emails_status_check
    check (status in ('sent', 'clicked', 'claimed'))
);

create unique index if not exists practitioner_claim_campaign_emails_tracking_token_idx
  on public.practitioner_claim_campaign_emails(tracking_token);

create unique index if not exists practitioner_claim_campaign_emails_campaign_email_idx
  on public.practitioner_claim_campaign_emails(campaign_id, recipient_email);

create index if not exists practitioner_claim_campaign_emails_campaign_id_idx
  on public.practitioner_claim_campaign_emails(campaign_id);

create index if not exists practitioner_claim_campaign_emails_practitioner_id_idx
  on public.practitioner_claim_campaign_emails(practitioner_id);

create index if not exists practitioner_claim_campaign_emails_sent_at_idx
  on public.practitioner_claim_campaign_emails(sent_at desc);

create index if not exists practitioner_claim_campaign_emails_clicked_at_idx
  on public.practitioner_claim_campaign_emails(clicked_at desc);

create index if not exists practitioner_claim_campaign_emails_claimed_at_idx
  on public.practitioner_claim_campaign_emails(claimed_at desc);


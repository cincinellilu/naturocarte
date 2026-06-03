alter table public.practitioner_accounts
  add column if not exists last_login_at timestamptz,
  add column if not exists login_count integer not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'practitioner_accounts_login_count_non_negative'
  ) then
    alter table public.practitioner_accounts
      add constraint practitioner_accounts_login_count_non_negative
      check (login_count >= 0);
  end if;
end
$$;

create index if not exists practitioner_accounts_last_login_at_idx
  on public.practitioner_accounts(last_login_at desc);


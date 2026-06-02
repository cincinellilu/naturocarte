alter table public.practitioners
  add column if not exists siret text;

create unique index if not exists practitioners_siret_uidx
  on public.practitioners (siret)
  where siret is not null;

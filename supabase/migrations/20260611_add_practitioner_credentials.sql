alter table public.practitioners
  add column if not exists training_school text,
  add column if not exists professional_affiliation text;

insert into storage.buckets (id, name, public)
values ('practitioner-photos', 'practitioner-photos', true)
on conflict (id) do update
set public = excluded.public;

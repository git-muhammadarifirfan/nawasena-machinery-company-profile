-- Add status to inquiries to support admin workflow + finance report
-- Run in Supabase SQL editor OR as a migration file.

alter table public.inquiries
  add column if not exists status text not null default 'new';

-- Keep status values consistent
alter table public.inquiries
  drop constraint if exists inquiries_status_check;

alter table public.inquiries
  add constraint inquiries_status_check
  check (status in ('new', 'progress', 'paid'));

create index if not exists inquiries_status_idx on public.inquiries(status);

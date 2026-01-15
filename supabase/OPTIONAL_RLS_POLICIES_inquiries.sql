-- OPTIONAL (only if you use RLS on public.inquiries)
-- This adds policies so:
-- - Anyone can INSERT inquiries (checkout)
-- - Only admins can SELECT/UPDATE inquiries (admin dashboard)
--
-- NOTE: enabling RLS without correct policies can block access.

-- alter table public.inquiries enable row level security;

do $$ begin
  create policy "Public can insert inquiries"
  on public.inquiries
  for insert
  to anon, authenticated
  with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can read inquiries"
  on public.inquiries
  for select
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admin can update inquiries"
  on public.inquiries
  for update
  to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
exception when duplicate_object then null; end $$;

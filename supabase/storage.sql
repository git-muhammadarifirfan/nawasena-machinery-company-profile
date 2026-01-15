-- Storage buckets:
-- 1) product-images (public)
-- 2) site-assets (public)
--
-- Create buckets in Supabase UI (Storage) with Public ON.

-- Public read product images
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
on storage.objects for select
to public
using (bucket_id = 'product-images');

-- Admin upload product images
drop policy if exists "Admin upload product images" on storage.objects;
create policy "Admin upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin(auth.uid()));

drop policy if exists "Admin update product images" on storage.objects;
create policy "Admin update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin(auth.uid()))
with check (bucket_id = 'product-images' and public.is_admin(auth.uid()));

drop policy if exists "Admin delete product images" on storage.objects;
create policy "Admin delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin(auth.uid()));

-- Public read site assets
drop policy if exists "Public read site assets" on storage.objects;
create policy "Public read site assets"
on storage.objects for select
to public
using (bucket_id = 'site-assets');

-- Admin upload site assets
drop policy if exists "Admin upload site assets" on storage.objects;
create policy "Admin upload site assets"
on storage.objects for insert
to authenticated
with check (bucket_id = 'site-assets' and public.is_admin(auth.uid()));

drop policy if exists "Admin update site assets" on storage.objects;
create policy "Admin update site assets"
on storage.objects for update
to authenticated
using (bucket_id = 'site-assets' and public.is_admin(auth.uid()))
with check (bucket_id = 'site-assets' and public.is_admin(auth.uid()));

drop policy if exists "Admin delete site assets" on storage.objects;
create policy "Admin delete site assets"
on storage.objects for delete
to authenticated
using (bucket_id = 'site-assets' and public.is_admin(auth.uid()));

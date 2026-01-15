-- Seed example data (optional)

insert into public.settings(key, value)
values ('admin_whatsapp', '6281234567890')
on conflict (key) do update set value = excluded.value;

insert into public.categories(name) values
  ('Mesin Pengolahan Pangan'),
  ('Mesin Kemasan'),
  ('Mesin Industri')
on conflict (name) do nothing;

-- Example products
insert into public.products(title, description, price, category_id, image_url, is_recommended)
select
  'Mesin Sealer Continuous',
  'Mesin sealer untuk kemasan plastik dengan hasil rapat dan konsisten. Cocok untuk UMKM makanan/minuman.',
  3500000,
  c.id,
  'https://images.unsplash.com/photo-1617821100297-5c1c7fbe3c7c?auto=format&fit=crop&w=1200&q=70',
  true
from public.categories c where c.name='Mesin Kemasan'
on conflict do nothing;

insert into public.products(title, description, price, category_id, image_url, is_recommended)
select
  'Mesin Mixer Adonan',
  'Mixer adonan kapasitas menengah, torsi kuat, mudah dibersihkan.',
  7800000,
  c.id,
  'https://images.unsplash.com/photo-1588167056547-12d39e72a0ce?auto=format&fit=crop&w=1200&q=70',
  true
from public.categories c where c.name='Mesin Pengolahan Pangan'
on conflict do nothing;

insert into public.products(title, description, price, category_id, image_url, is_recommended)
select
  'Mesin Conveyor Mini',
  'Conveyor mini untuk membantu alur produksi dan packing.',
  12000000,
  c.id,
  'https://images.unsplash.com/photo-1581092334500-6a7e04f0f4d0?auto=format&fit=crop&w=1200&q=70',
  false
from public.categories c where c.name='Mesin Industri'
on conflict do nothing;


-- Site settings (optional defaults)
insert into public.settings(key, value) values ('site_name', 'Nawasena Machinery')
on conflict (key) do update set value = excluded.value;

insert into public.settings(key, value) values ('logo_url', '')
on conflict (key) do update set value = excluded.value;

insert into public.settings(key, value) values ('about_title', 'Tentang Kami')
on conflict (key) do update set value = excluded.value;

insert into public.settings(key, value) values ('about_text', '')
on conflict (key) do update set value = excluded.value;

insert into public.settings(key, value) values ('footer_address', '')
on conflict (key) do update set value = excluded.value;

insert into public.settings(key, value) values ('footer_phone', '')
on conflict (key) do update set value = excluded.value;

insert into public.settings(key, value) values ('footer_email', '')
on conflict (key) do update set value = excluded.value;

insert into public.settings(key, value) values ('instagram_url', '')
on conflict (key) do update set value = excluded.value;

insert into public.settings(key, value) values ('facebook_url', '')
on conflict (key) do update set value = excluded.value;

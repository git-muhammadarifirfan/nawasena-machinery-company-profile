# Nawasena Machinery — Web Katalog & Checkout WhatsApp (Shared Hosting Ready)

Frontend **static** (Vite + React + TypeScript + Tailwind). Database & Auth pakai **Supabase**.

✅ Customer **tanpa login**  
✅ Cart + Checkout form → buka WhatsApp dengan pesan otomatis ke nomor admin dari database  
✅ Admin dashboard (login) → CRUD Produk, CRUD Kategori, Manage Admin, Settings nomor WhatsApp, Lihat Inquiry (opsional tersimpan)

---

## 1) Setup Supabase (WAJIB)

### A. Buat project Supabase
1. Buat project di Supabase.
2. Buka **SQL Editor** → jalankan file:
   - `supabase/schema.sql`
   - `supabase/seed.sql` (opsional, untuk data contoh)

### B. Buat Admin Pertama
Cara cepat (tanpa Edge Function dulu):
1. Authentication → Users → **Add user** (email & password).
2. Setelah user ada, jalankan SQL ini (ganti USER_ID):
```sql
insert into public.admins(user_id) values ('USER_ID') on conflict do nothing;
```
> USER_ID bisa dilihat di Authentication → Users.

### C. (Opsional tapi direkomendasikan) Deploy Edge Function untuk “Tambah Admin” dari dashboard
Ini supaya dashboard bisa bikin admin baru dengan aman (pakai **Service Role** di serverless Supabase, bukan di frontend).

1. Install Supabase CLI (lihat docs Supabase).
2. Login & link project:
```bash
supabase login
supabase link --project-ref <PROJECT_REF>
```
3. Deploy function:
```bash
supabase functions deploy invite-admin
```
4. Set secrets (di terminal):
```bash
supabase secrets set SUPABASE_URL="https://<project>.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<YOUR_SERVICE_ROLE_KEY>"
supabase secrets set SUPABASE_ANON_KEY="<YOUR_ANON_KEY>"
```
> Service role key ada di Supabase: Project Settings → API.

Kalau kamu **tidak** deploy function ini, menu “Tambah Admin” di dashboard tetap ada tapi akan menampilkan pesan bahwa function belum tersedia.

---

## 2) Setup Frontend

### A. Isi ENV
Copy `.env.example` → `.env` lalu isi:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### B. Install & Run (local dev)
```bash
npm install
npm run dev
```

### C. Build untuk Shared Hosting
```bash
npm run build
```
Hasil build ada di folder `dist/`.

Upload semua isi `dist/` ke **public_html** (atau folder web) di shared hosting kamu.

> Kalau hosting kamu pakai Apache, file `dist/.htaccess` sudah disiapkan supaya React Router jalan (SPA fallback).

---

## 3) Konsep Checkout WhatsApp
Saat user klik **Kirim**, web akan:
1. Simpan inquiry ke Supabase (table `inquiries`) **(opsional)**.
2. Buka URL `https://wa.me/<nomor>?text=<pesan>` sehingga WhatsApp terbuka dengan pesan yang sudah terisi.

Catatan penting:
- Browser **tidak bisa** mengirim pesan WhatsApp “silent” tanpa interaksi user. Solusi standar adalah membuka link WA (ini yang dipakai website-store kebanyakan).

---

## Struktur Project
- `src/` aplikasi React
- `supabase/` SQL schema + seed + Edge Function (optional)
- `dist/` hasil build (setelah `npm run build`)

---

## Default UI Theme
Hitam / silver dengan gradient, modern & responsif.

Enjoy 🚀


## Supabase Setup (Wajib)

1. Jalankan `supabase/schema.sql` di SQL Editor.
2. (Opsional) jalankan `supabase/seed.sql`.
3. Buat bucket Storage: `product-images` dan `site-assets` (Public ON).
4. Jalankan `supabase/storage.sql` untuk policy.
5. Tambahkan kolom `features` kalau project lama: 

```sql
alter table public.products add column if not exists features text[] not null default '{}';
```

## Settings yang bisa diatur dari Admin Panel
- site_name, logo_url (upload)
- about_title, about_text
- footer_address, footer_phone, footer_email
- instagram_url, facebook_url
- admin_whatsapp

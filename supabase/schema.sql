-- Nawasena Machinery schema (Supabase Postgres)
-- Run this in Supabase SQL Editor

create extension if not exists pgcrypto;

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  price numeric not null default 0,
  category_id uuid null references public.categories(id) on delete set null,
  image_url text null,
  is_recommended boolean not null default false,
  features text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Settings
create table if not exists public.settings (
  key text primary key,
  value text not null
);

-- Admins (who can manage dashboard)
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Inquiries (form submissions)
create table if not exists public.inquiries (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  customer_name text not null,
  whatsapp text not null,
  business_name text null,
  location text not null,
  notes text null,
  items jsonb not null
);

-- Helper function to check admin (used in RLS)
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.admins a where a.user_id = uid);
$$;

-- Enable RLS
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.settings enable row level security;
alter table public.admins enable row level security;
alter table public.inquiries enable row level security;

-- Categories policies
drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public" on public.categories
for select using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Products policies
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public" on public.products
for select using (true);

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Settings policies (public read, admin write)
drop policy if exists "settings_select_public" on public.settings;
create policy "settings_select_public" on public.settings
for select using (true);

drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write" on public.settings
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Admins policies (only admins can see/manage admins list)
drop policy if exists "admins_admin_only" on public.admins;
create policy "admins_admin_only" on public.admins
for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Inquiries policies
drop policy if exists "inquiries_insert_public" on public.inquiries;
create policy "inquiries_insert_public" on public.inquiries
for insert with check (true);

drop policy if exists "inquiries_select_admin" on public.inquiries;
create policy "inquiries_select_admin" on public.inquiries
for select using (public.is_admin(auth.uid()));

drop policy if exists "inquiries_delete_admin" on public.inquiries;
create policy "inquiries_delete_admin" on public.inquiries
for delete using (public.is_admin(auth.uid()));

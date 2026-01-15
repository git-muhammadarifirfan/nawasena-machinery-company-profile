import { supabase } from "./supabase";
import type { Category, Product, SettingsRow, Inquiry } from "./types";

// -------- SETTINGS (key/value) --------
export async function getSettings(key: string) {
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("key", key)
    .single<SettingsRow>();
  if (error) throw error;
  return data;
}

export async function getSettingValue(key: string, fallback = ""): Promise<string> {
  try {
    const row = await getSettings(key);
    return row?.value ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getSettingsMap(keys: string[]): Promise<Record<string, string>> {
  if (!keys.length) return {};
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .in("key", keys)
    .returns<SettingsRow[]>();
  if (error) throw error;

  const map: Record<string, string> = {};
  for (const k of keys) map[k] = "";
  for (const row of data ?? []) map[row.key] = row.value;
  return map;
}

export async function adminUpsertSetting(key: string, value: string) {
  const { data, error } = await supabase
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" })
    .select("*")
    .single<SettingsRow>();
  if (error) throw error;
  return data;
}

// -------- PUBLIC --------
export async function listCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true })
    .returns<Category[]>();
  if (error) throw error;
  return data ?? [];
}

export async function listProducts(opts?: { categoryId?: string; recommendedOnly?: boolean; search?: string }) {
  let q = supabase
    .from("products")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: false });

  if (opts?.categoryId) q = q.eq("category_id", opts.categoryId);
  if (opts?.recommendedOnly) q = q.eq("is_recommended", true);
  if (opts?.search && opts.search.trim()) q = q.ilike("title", `%${opts.search.trim()}%`);

  const { data, error } = await q.returns<Product[]>();
  if (error) throw error;
  return data ?? [];
}

export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single<Product>();
  if (error) throw error;
  return data;
}

export async function createInquiry(payload: Omit<Inquiry, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("inquiries")
    .insert(payload)
    .select("*")
    .single<Inquiry>();
  if (error) throw error;
  return data;
}

// -------- ADMIN --------
export async function isAdmin(userId: string) {
  const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", userId).maybeSingle();
  if (error) return false;
  return !!data?.user_id;
}

export async function adminListInquiries() {
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Inquiry[]>();
  if (error) throw error;
  return data ?? [];
}

export async function adminCreateCategory(name: string) {
  const { data, error } = await supabase.from("categories").insert({ name }).select("*").single<Category>();
  if (error) throw error;
  return data;
}

export async function adminUpdateCategory(id: string, name: string) {
  const { data, error } = await supabase.from("categories").update({ name }).eq("id", id).select("*").single<Category>();
  if (error) throw error;
  return data;
}

export async function adminDeleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function adminCreateProduct(p: Partial<Product>) {
  const { data, error } = await supabase
    .from("products")
    .insert(p)
    .select("*, category:categories(*)")
    .single<Product>();
  if (error) throw error;
  return data;
}

export async function adminUpdateProduct(id: string, p: Partial<Product>) {
  const { data, error } = await supabase
    .from("products")
    .update(p)
    .eq("id", id)
    .select("*, category:categories(*)")
    .single<Product>();
  if (error) throw error;
  return data;
}

export async function adminDeleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function adminListAdmins() {
  const { data, error } = await supabase.from("admins").select("user_id, created_at").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminListPaidInquiries(opts?: {
  from?: string;
  to?: string;
}) {
  let q = supabase
    .from("inquiries")
    .select("*")
    .eq("status", "PAID")
    .order("created_at", { ascending: false });

  if (opts?.from) q = q.gte("created_at", opts.from);
  if (opts?.to) q = q.lte("created_at", opts.to);

  const { data, error } = await q.returns<Inquiry[]>();
  if (error) throw error;
  return data ?? [];
}


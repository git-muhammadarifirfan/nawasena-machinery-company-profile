import { supabase } from "./supabase";

export type UploadResult = { publicUrl: string; path: string };

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function uploadToBucket(bucket: string, folder: string, file: File, maxMB: number): Promise<UploadResult> {
  if (!file) throw new Error("File tidak ditemukan");
  if (file.size > maxMB * 1024 * 1024) {
    throw new Error(`Ukuran file maksimal ${maxMB}MB`);
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const allowed = ["png", "jpg", "jpeg", "webp"];
  if (!allowed.includes(ext)) {
    throw new Error("Format file harus png/jpg/jpeg/webp");
  }

  const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const safeName = sanitizeFileName(file.name);
  const path = `${folder}/${unique}-${safeName}`;

  const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined
  });

  if (upErr) throw upErr;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("Gagal mendapatkan public URL");

  return { publicUrl: data.publicUrl, path };
}

export async function uploadProductImage(file: File): Promise<UploadResult> {
  return uploadToBucket("product-images", "products", file, 5);
}

export async function uploadSiteLogo(file: File): Promise<UploadResult> {
  return uploadToBucket("site-assets", "branding", file, 3);
}

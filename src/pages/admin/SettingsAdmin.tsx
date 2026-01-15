import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardBody } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input, Textarea } from "../../ui/Input";
import { useToast } from "../../ui/Toast";
import { adminUpsertSetting, getSettingsMap } from "../../lib/db";
import { uploadSiteLogo } from "../../lib/storage";
import { useSiteSettings } from "../../state/siteSettings";

const KEYS = [
  "admin_whatsapp",
  "site_name",
  "logo_url",
  "about_title",
  "about_text",
  "footer_address",
  "footer_phone",
  "footer_email",
  "instagram_url",
  "facebook_url",
] as const;

type Key = (typeof KEYS)[number];

const DEFAULTS: Record<Key, string> = {
  admin_whatsapp: "6281234567890",
  site_name: "Nawasena Machinery",
  logo_url: "",
  about_title: "Tentang Kami",
  about_text: "",
  footer_address: "",
  footer_phone: "",
  footer_email: "",
  instagram_url: "",
  facebook_url: "",
};

function isEqualForm(a: Record<Key, string>, b: Record<Key, string>) {
  for (const k of KEYS) if (String(a[k] ?? "") !== String(b[k] ?? "")) return false;
  return true;
}

function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={["min-w-0", className].join(" ")}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <div className="text-xs font-medium text-white/80">{label}</div>
        {hint ? <div className="text-[11px] text-white/45">{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Section({
  title,
  desc,
  children,
  right,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <Card>
      <CardBody>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white">{title}</div>
            {desc ? <div className="mt-1 text-xs leading-relaxed text-white/60">{desc}</div> : null}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>

        <div className="mt-4">{children}</div>
      </CardBody>
    </Card>
  );
}

export default function SettingsAdmin() {
  const toast = useToast();
  const { refresh } = useSiteSettings();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const [form, setForm] = useState<Record<Key, string>>({ ...DEFAULTS });
  const [initial, setInitial] = useState<Record<Key, string> | null>(null);

  const mounted = useRef(true);

  // logo preview cleanup
  useEffect(() => {
    if (!logoFile) {
      setLogoPreview("");
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      setLoading(true);
      try {
        const map = (await getSettingsMap(KEYS as unknown as string[])) as Partial<Record<Key, string>>;
        const merged: Record<Key, string> = { ...DEFAULTS, ...(map as any) };

        if (!mounted.current) return;
        setForm(merged);
        setInitial(merged);
      } catch (e: any) {
        toast.push({ kind: "err", title: "Gagal memuat settings", desc: e?.message });
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();

    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDirty = useMemo(() => {
    if (!initial) return false;
    return !isEqualForm(form, initial) || !!logoFile;
  }, [form, initial, logoFile]);

  const changedKeys = useMemo(() => {
    if (!initial) return [];
    const keys: Key[] = [];
    for (const k of KEYS) if (String(form[k] ?? "") !== String(initial[k] ?? "")) keys.push(k);
    return keys;
  }, [form, initial]);

  async function save(e?: React.MouseEvent) {
    e?.preventDefault?.();

    if (!initial) return;
    if (!isDirty) {
      toast.push({ kind: "ok", title: "Tidak ada perubahan" });
      return;
    }

    setSaving(true);
    try {
      let logoUrl = form.logo_url || "";

      if (logoFile) {
        const up = await uploadSiteLogo(logoFile);
        logoUrl = up.publicUrl;
      }

      const next: Record<Key, string> = {
        ...form,
        logo_url: logoUrl,
      };

      // hanya upsert yang berubah (lebih ringan + gak bikin “kerasa refresh”)
      const keysToSave = new Set<Key>(changedKeys);
      if (logoFile) keysToSave.add("logo_url");

      await Promise.all(
        Array.from(keysToSave).map((k) => adminUpsertSetting(k, String(next[k] ?? "")))
      );

      setForm(next);
      setInitial(next);
      setLogoFile(null);

      // update store settings supaya komponen lain langsung ikut berubah (tanpa reload browser)
      try {
        await refresh();
      } catch {
        // kalau refresh gagal, tetap lanjut (data sudah tersimpan)
      }

      // extra: broadcast event (kalau ada listener di app kamu)
      window.dispatchEvent(new CustomEvent("nm:settings-updated", { detail: next }));

      toast.push({ kind: "ok", title: "Settings tersimpan" });
    } catch (e: any) {
      toast.push({ kind: "err", title: "Gagal simpan", desc: e?.message });
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    if (!initial) return;
    setForm(initial);
    setLogoFile(null);
    toast.push({ kind: "ok", title: "Perubahan dibatalkan" });
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-white/60">
        Memuat…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-6">
      {/* Header / Action bar (enak di HP: sticky) */}
      <div className="sticky top-0 z-10 -mx-3 mb-4 border-b border-white/10 bg-zinc-950/80 px-3 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-base font-semibold text-white">Pengaturan Website</div>
            <div className="mt-0.5 text-xs text-white/55">
              Ubah branding, tentang kami, footer, dan nomor WhatsApp penerima checkout.
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="text-[11px] text-white/50 sm:mr-2">
              {isDirty ? "Ada perubahan belum disimpan" : "Semua perubahan tersimpan"}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
              <Button
                type="button"
                className="h-11"
                onClick={reset}
                disabled={saving || !isDirty}
              >
                Batal
              </Button>
              <Button
                type="button"
                className="h-11"
                onClick={save}
                disabled={saving || !isDirty}
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Layout: 1 kolom (HP) -> 2 kolom (desktop) */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="grid gap-4 lg:col-span-8">
          <Section
            title="Branding"
            desc="Atur nama toko dan logo yang tampil di navbar & footer."
            right={
              <div className="text-[11px] text-white/45">
                Disarankan logo PNG/WEBP.
              </div>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama Toko">
                <Input
                  value={form.site_name}
                  onChange={(e) => setForm((p) => ({ ...p, site_name: e.target.value }))}
                />
              </Field>

              <Field label="Logo (Upload)" hint="png/jpg/webp">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm
                             file:mr-3 file:rounded-xl file:border file:border-white/10 file:bg-white/10 file:px-3 file:py-1
                             file:text-xs file:text-white/90 hover:bg-white/10"
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                />

                <div className="mt-3 flex items-center gap-3">
                  {logoPreview || form.logo_url ? (
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-2">
                      <img
                        src={logoPreview || form.logo_url}
                        className="h-16 w-16 rounded-xl object-cover sm:h-20 sm:w-20"
                        alt="logo"
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-[11px] text-white/55">
                      Belum ada logo. Default akan tampil “NM”.
                    </div>
                  )}

                  <div className="min-w-0 text-[11px] text-white/50">
                    <div className="truncate">Preview logo</div>
                    <div className="mt-1">
                      Tips: gunakan background transparan agar rapi di navbar.
                    </div>
                  </div>
                </div>
              </Field>
            </div>
          </Section>

          <Section title="Tentang Kami" desc="Konten halaman About. Disarankan 2–4 paragraf singkat.">
            <div className="grid gap-4">
              <Field label="Judul">
                <Input
                  value={form.about_title}
                  onChange={(e) => setForm((p) => ({ ...p, about_title: e.target.value }))}
                />
              </Field>

              <Field label="Isi" hint="Boleh multi paragraf">
                <Textarea
                  value={form.about_text}
                  onChange={(e) => setForm((p) => ({ ...p, about_text: e.target.value }))}
                  placeholder="Tulis profil perusahaan..."
                  className="min-h-[140px] sm:min-h-[180px]"
                />
              </Field>
            </div>
          </Section>

          <Section title="Footer & Kontak" desc="Informasi yang tampil di bagian bawah website.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Alamat" className="sm:col-span-2">
                <Textarea
                  value={form.footer_address}
                  onChange={(e) => setForm((p) => ({ ...p, footer_address: e.target.value }))}
                  className="min-h-[110px]"
                  placeholder="Alamat perusahaan..."
                />
              </Field>

              <Field label="Telepon">
                <Input
                  value={form.footer_phone}
                  onChange={(e) => setForm((p) => ({ ...p, footer_phone: e.target.value }))}
                  placeholder="08xxxx / +62..."
                />
              </Field>

              <Field label="Email">
                <Input
                  value={form.footer_email}
                  onChange={(e) => setForm((p) => ({ ...p, footer_email: e.target.value }))}
                  placeholder="admin@nawasena.id"
                />
              </Field>

              <Field label="Instagram URL" hint="https://instagram.com/...">
                <Input
                  value={form.instagram_url}
                  onChange={(e) => setForm((p) => ({ ...p, instagram_url: e.target.value }))}
                  placeholder="https://instagram.com/..."
                />
              </Field>

              <Field label="Facebook URL" hint="https://facebook.com/...">
                <Input
                  value={form.facebook_url}
                  onChange={(e) => setForm((p) => ({ ...p, facebook_url: e.target.value }))}
                  placeholder="https://facebook.com/..."
                />
              </Field>
            </div>
          </Section>

          <Section
            title="WhatsApp Penerima Checkout"
            desc="Nomor ini yang akan menerima pesan otomatis dari tombol checkout."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nomor WhatsApp" hint="Format: 62xxxx (tanpa +)">
                <Input
                  value={form.admin_whatsapp}
                  onChange={(e) => setForm((p) => ({ ...p, admin_whatsapp: e.target.value }))}
                  placeholder="6281234567890"
                  inputMode="numeric"
                />
              </Field>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
                <div className="font-semibold text-white/85">Contoh yang benar</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>62812xxxxxxx</li>
                  <li>62 812 xxxx xxxx (boleh spasi, akan disimpan apa adanya)</li>
                </ul>
                <div className="mt-2 text-[11px] text-white/45">
                  Kalau mau lebih strict, bisa aku bantu validasi & auto-normalize.
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Sidebar (desktop) */}
        <div className="grid gap-4 lg:col-span-4">
          <Card>
            <CardBody>
              <div className="text-sm font-semibold text-white">Ringkasan</div>
              <div className="mt-3 space-y-3 text-xs text-white/60">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-white/80">Nama toko</div>
                  <div className="mt-1 truncate text-white">{form.site_name || "-"}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-white/80">WA checkout</div>
                  <div className="mt-1 truncate text-white">{form.admin_whatsapp || "-"}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-white/80">Social</div>
                  <div className="mt-1 space-y-1">
                    <div className="truncate">IG: {form.instagram_url || "-"}</div>
                    <div className="truncate">FB: {form.facebook_url || "-"}</div>
                  </div>
                </div>

                <div className="text-[11px] text-white/45">
                  Tips: setelah simpan, perubahan harusnya langsung kebaca di website tanpa reload browser
                  (karena admin memanggil <code className="text-white/60">refresh()</code> + broadcast event).
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button type="button" className="h-11" onClick={reset} disabled={saving || !isDirty}>
                  Batal
                </Button>
                <Button type="button" className="h-11" onClick={save} disabled={saving || !isDirty}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Bottom spacing for sticky bar on small screens */}
      <div className="h-6" />
    </div>
  );
}

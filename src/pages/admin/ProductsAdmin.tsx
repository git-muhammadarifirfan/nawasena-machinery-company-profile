import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Category, Product } from "../../lib/types";
import {
  listCategories,
  listProducts,
  adminCreateProduct,
  adminDeleteProduct,
  adminUpdateProduct,
} from "../../lib/db";

import { Card, CardBody, Badge } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input, Textarea } from "../../ui/Input";
import { rupiah, clsx } from "../../ui/format";
// import { useToast } from "../../ui/Toast";
import { useToast, type ToastKind } from "../../ui/Toast";
import { uploadProductImage } from "../../lib/storage";
import { Modal, ConfirmModal } from "../../ui/Modal";
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Star,
  ChevronDown,
  Check,
} from "lucide-react";

const empty: Partial<Product> = {
  title: "",
  description: "",
  price: 0,
  category_id: null,
  image_url: null,
  is_recommended: false,
  features: [],
};

function nnum(v: any) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function shortText(s: any, max = 42) {
  const t = String(s ?? "");
  if (t.length <= max) return t;
  return t.slice(0, Math.max(0, max - 1)) + "…";
}

/** Dropdown kategori (bagus, searchable, works di modal/topbar) */
function CategoryDropdown({
  value,
  onChange,
  options,
  placeholder = "Semua kategori",
  allLabel = "Semua kategori",
  withinModal,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ id: any; name: string }>;
  placeholder?: string;
  allLabel?: string;
  withinModal?: boolean; // kalau dipakai di Modal, z-index lebih tinggi
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  const selectedName =
    value === ""
      ? allLabel
      : options.find((o) => String(o.id) === String(value))?.name ??
        placeholder;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as any)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative w-full sm:w-auto min-w-[180px]">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={clsx(
          "h-10 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-sm outline-none",
          "flex items-center justify-between gap-3",
          "hover:bg-white/7 focus-visible:ring-2 focus-visible:ring-white/15"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="min-w-0 truncate text-white/90">{selectedName}</span>
        <ChevronDown
          className={clsx(
            "h-4 w-4 text-white/60 transition",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div
          className={clsx(
            "absolute left-0 right-0 mt-2 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950",
            "shadow-[0_30px_120px_-80px_rgba(0,0,0,.95)]",
            withinModal ? "z-[120]" : "z-[60]"
          )}
        >
          <div className="p-2 border-b border-white/10">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kategori…"
              className="h-10"
            />
          </div>

          <div className="max-h-72 overflow-auto p-2">
            <button
              type="button"
              className={clsx(
                "w-full text-left rounded-2xl px-3 py-2 text-sm transition",
                value === ""
                  ? "bg-white/10 text-white"
                  : "text-white/80 hover:bg-white/7"
              )}
              onClick={() => {
                onChange("");
                setOpen(false);
                setQuery("");
              }}
              role="option"
              aria-selected={value === ""}
            >
              <span className="inline-flex items-center gap-2">
                {value === "" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="w-4" />
                )}
                {allLabel}
              </span>
            </button>

            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-xs text-white/50">
                Tidak ada kategori.
              </div>
            ) : (
              filtered.map((c) => {
                const active = String(c.id) === String(value);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={clsx(
                      "w-full text-left rounded-2xl px-3 py-2 text-sm transition",
                      active
                        ? "bg-white/10 text-white"
                        : "text-white/80 hover:bg-white/7"
                    )}
                    onClick={() => {
                      onChange(String(c.id));
                      setOpen(false);
                      setQuery("");
                    }}
                    role="option"
                    aria-selected={active}
                  >
                    <span className="inline-flex items-center gap-2">
                      {active ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="w-4" />
                      )}
                      {c.name}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-2 border-t border-white/10">
            <button
              type="button"
              className="w-full h-10 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white/85 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ProductsAdmin() {
  const toast = useToast();

  const [cats, setCats] = useState<Category[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");

  const [openForm, setOpenForm] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Product>>(empty);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [featureInput, setFeatureInput] = useState("");
  const [features, setFeatures] = useState<string[]>([]);

  const [confirmDel, setConfirmDel] = useState<{
    open: boolean;
    id?: string;
    title?: string;
  }>({ open: false });

  function notify(kind: ToastKind, title: string, desc?: string) {
    toast.push({ kind, title, desc });
  }

  async function load(opts?: { silent?: boolean }) {
    const silent = !!opts?.silent;
    setLoading(true);
    try {
      const [c, p] = await Promise.all([listCategories(), listProducts()]);
      setCats(c);
      setItems(p);
      if (!silent)
        notify(
          "ok",
          "Berhasil refresh",
          `${p.length} produk • ${c.length} kategori`
        );
    } catch (err: any) {
      notify("err", "Gagal memuat", err?.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // objectURL cleanup for preview (biar ga leak)
  useEffect(() => {
    if (!imageFile) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  const catNameById = useMemo(() => {
    const m = new Map<string, string>();
    cats.forEach((c) => m.set(String(c.id), c.name));
    return m;
  }, [cats]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((p) => {
      if (categoryId && String(p.category_id ?? "") !== categoryId)
        return false;
      if (!s) return true;
      return (
        (p.title ?? "").toLowerCase().includes(s) ||
        (p.description ?? "").toLowerCase().includes(s)
      );
    });
  }, [items, q, categoryId]);

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setForm(empty);
    setImageFile(null);
    setFeatures([]);
    setFeatureInput("");
    setOpenForm(true);
  }

  function openEdit(p: Product) {
    setMode("edit");
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      price: nnum(p.price),
      category_id: p.category_id,
      image_url: p.image_url ?? null,
      is_recommended: !!p.is_recommended,
      features: (p.features ?? []) as any,
    });
    setFeatures(((p.features ?? []) as any) ?? []);
    setFeatureInput("");
    setImageFile(null);
    setOpenForm(true);
  }

  function resetForm() {
    setOpenForm(false);
    setMode("create");
    setEditingId(null);
    setForm(empty);
    setImageFile(null);
    setFeatures([]);
    setFeatureInput("");
  }

  const canSave = useMemo(() => {
    return (
      !!form.title?.trim() &&
      !!form.description?.trim() &&
      nnum(form.price) >= 0
    );
  }, [form]);

  async function save() {
    if (!canSave) {
      notify("warn", "Lengkapi data", "Judul & deskripsi wajib diisi.");
      return;
    }
    if (saving) return;

    setSaving(true);
    try {
      let imageUrl = form.image_url ?? null;

      if (imageFile) {
        const up = await uploadProductImage(imageFile);
        imageUrl = up.publicUrl;
      }

      const payload: Partial<Product> = {
        title: String(form.title).trim(),
        description: String(form.description).trim(),
        price: nnum(form.price),
        category_id: form.category_id || null,
        image_url: imageUrl,
        is_recommended: !!form.is_recommended,
        features: (features || []).map((x) => String(x).trim()).filter(Boolean),
      };

      if (mode === "create") {
        await adminCreateProduct(payload);
        notify("ok", "Produk ditambahkan", shortText(payload.title, 48));
      } else if (editingId) {
        await adminUpdateProduct(editingId, payload);
        notify(
          "ok",
          "Produk diupdate",
          `${shortText(payload.title, 40)} • ${shortText(editingId, 18)}`
        );
      }

      resetForm();
      await load({ silent: true });
    } catch (err: any) {
      notify("err", "Gagal simpan", err?.message);
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    const id = confirmDel.id;
    if (!id || deleting) return;

    setDeleting(true);
    try {
      await adminDeleteProduct(id);
      notify("ok", "Produk dihapus", shortText(confirmDel.title ?? id, 52));
      setConfirmDel({ open: false });
      await load({ silent: true });
    } catch (err: any) {
      notify("err", "Gagal hapus", err?.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid gap-4 max-w-full">
      {/* Top bar */}
      <Card>
        <CardBody>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-semibold">Produk</div>
              <div className="mt-1 text-xs text-white/60">
                Responsif semua device. Tambah/Edit/Hapus via modal.
              </div>
            </div>

            {/* controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari produk…"
                  className="pl-10 w-full"
                />
              </div>

              {/* ✅ dropdown kategori bagus */}
              <CategoryDropdown
                value={categoryId}
                onChange={setCategoryId}
                options={cats as any}
              />

              <Button
                variant="ghost"
                onClick={() => load({ silent: false })}
                className="h-10 w-full sm:w-auto"
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>

              <Button
                onClick={openCreate}
                className="h-10 w-full sm:w-auto bg-emerald-500 text-black hover:bg-emerald-400"
              >
                <Plus className="h-4 w-4" />
                Tambah
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* List */}
      <Card>
        <CardBody>
          {loading ? (
            <div className="text-white/60">Memuat...</div>
          ) : filtered.length === 0 ? (
            <div className="text-white/60">
              {items.length === 0
                ? "Belum ada produk."
                : "Tidak ada hasil pencarian."}
            </div>
          ) : (
            <>
              {/* Desktop header */}
              <div className="hidden lg:grid grid-cols-12 gap-3 px-3 pb-2 text-[11px] text-white/45">
                <div className="col-span-5">Produk</div>
                <div className="col-span-2">Kategori</div>
                <div className="col-span-2">Harga</div>
                <div className="col-span-2">ID</div>
                <div className="col-span-1 text-right">Aksi</div>
              </div>

              <div className="grid gap-2">
                {filtered.map((p) => {
                  const catName = p.category_id
                    ? catNameById.get(String(p.category_id))
                    : "";
                  return (
                    <div
                      key={p.id}
                      className={clsx(
                        "rounded-3xl border border-white/10 bg-white/5 transition",
                        "hover:bg-white/7",
                        "max-w-full overflow-hidden"
                      )}
                    >
                      {/* Desktop row */}
                      <div className="hidden lg:grid grid-cols-12 gap-3 p-3 items-center">
                        <div className="col-span-5 flex items-center gap-3 min-w-0">
                          <div className="h-12 w-16 overflow-hidden rounded-2xl border border-white/10 bg-black/30 shrink-0">
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                className="h-full w-full object-cover"
                                alt={p.title}
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-full w-full grid place-items-center text-[10px] text-white/40">
                                No Image
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 overflow-hidden">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="text-sm font-semibold truncate">
                                {p.title}
                              </div>
                              {p.is_recommended ? (
                                <Badge>
                                  <span className="inline-flex items-center gap-1">
                                    <Star className="h-3.5 w-3.5 text-amber-300" />
                                    Rekomendasi
                                  </span>
                                </Badge>
                              ) : null}
                            </div>
                            <div className="mt-0.5 text-xs text-white/60 line-clamp-1">
                              {p.description}
                            </div>
                          </div>
                        </div>

                        <div className="col-span-2 min-w-0">
                          {catName ? (
                            <div className="inline-flex max-w-full truncate rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                              {catName}
                            </div>
                          ) : (
                            <div className="text-xs text-white/45">-</div>
                          )}
                        </div>

                        <div className="col-span-2 min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {rupiah(nnum(p.price))}
                          </div>
                          <div className="text-[11px] text-white/45">Harga</div>
                        </div>

                        <div className="col-span-2 min-w-0">
                          <div className="text-xs text-white/75 break-all leading-snug">
                            {p.id}
                          </div>
                          <div className="text-[11px] text-white/45">ID</div>
                        </div>

                        <div className="col-span-1 flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            className="h-9 px-3"
                            onClick={() => openEdit(p)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="danger"
                            className="h-9 px-3"
                            onClick={() =>
                              setConfirmDel({
                                open: true,
                                id: p.id,
                                title: p.title,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Mobile / Tablet (gambar kecil, list rapat) */}
                      <div className="lg:hidden">
                        <div className="grid grid-cols-12 gap-2 p-3 items-start">
                          <div className="col-span-8 min-w-0 flex gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-black/30 shrink-0">
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  className="h-full w-full object-cover"
                                  alt={p.title}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="h-full w-full grid place-items-center text-[9px] text-white/40">
                                  —
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="text-[13px] font-semibold leading-snug truncate">
                                  {p.title}
                                </div>
                                {p.is_recommended ? (
                                  <span className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/75">
                                    ⭐
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-0.5 text-[11px] text-white/60 line-clamp-1">
                                {p.description}
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                {catName ? (
                                  <span className="max-w-full truncate rounded-xl border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/75">
                                    {catName}
                                  </span>
                                ) : null}
                                <span className="text-[10px] text-white/45">
                                  ID:{" "}
                                  <span className="text-white/60">
                                    {shortText(p.id, 12)}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="col-span-2 text-right">
                            <div className="text-[10px] text-white/45">Rp</div>
                            <div className="text-[13px] font-semibold leading-tight">
                              {rupiah(nnum(p.price)).replace("Rp", "").trim()}
                            </div>
                          </div>

                          <div className="col-span-2 flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              className="h-9 w-9 px-0"
                              onClick={() => openEdit(p)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="danger"
                              className="h-9 w-9 px-0"
                              onClick={() =>
                                setConfirmDel({
                                  open: true,
                                  id: p.id,
                                  title: p.title,
                                })
                              }
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Form Modal */}
      <Modal
        open={openForm}
        wide
        title={mode === "create" ? "Tambah Produk" : "Edit Produk"}
        onClose={resetForm}
        footer={
          <>
            <Button variant="ghost" onClick={resetForm} type="button">
              Batal
            </Button>
            <Button onClick={save} disabled={!canSave || saving} type="button">
              {saving
                ? "Menyimpan..."
                : mode === "create"
                ? "Simpan"
                : "Update"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-3">
            <div>
              <div className="mb-1 text-xs text-white/70">Judul *</div>
              <Input
                value={form.title ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>

            <div>
              <div className="mb-1 text-xs text-white/70">Deskripsi *</div>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Deskripsi umum produk..."
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-xs text-white/70">Harga</div>
                <Input
                  value={String(form.price ?? 0)}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      price: Number(e.target.value || 0),
                    }))
                  }
                  inputMode="numeric"
                />
              </div>

              <div>
                <div className="mb-1 text-xs text-white/70">Kategori</div>
                {/* ✅ dropdown kategori bagus juga di modal */}
                <CategoryDropdown
                  value={String(form.category_id ?? "")}
                  onChange={(v) =>
                    setForm((p) => ({ ...p, category_id: v || null }))
                  }
                  options={cats as any}
                  placeholder="-"
                  allLabel="-"
                  withinModal
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                checked={!!form.is_recommended}
                onChange={(e) =>
                  setForm((p) => ({ ...p, is_recommended: e.target.checked }))
                }
              />
              Jadikan Rekomendasi <Star className="h-4 w-4 text-amber-300" />
            </label>

            <div>
              <div className="mb-1 text-xs text-white/70">
                Detail Poin (Specs)
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Contoh: Kapasitas 5kg/batch"
                />
                <Button
                  className="h-10 w-full sm:w-auto"
                  type="button"
                  onClick={() => {
                    const v = featureInput.trim();
                    if (!v) return;
                    setFeatures((prev) => [...prev, v]);
                    setFeatureInput("");
                    notify("info", "Specs ditambah", v);
                  }}
                >
                  + Tambah
                </Button>
              </div>

              {features.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {features.map((f, idx) => (
                    <div
                      key={`${f}-${idx}`}
                      className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="text-sm text-white/80 break-words">
                        {f}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          className="h-9 px-3"
                          type="button"
                          onClick={() => {
                            if (idx === 0) return;
                            setFeatures((prev) => {
                              const next = [...prev];
                              [next[idx - 1], next[idx]] = [
                                next[idx],
                                next[idx - 1],
                              ];
                              return next;
                            });
                          }}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-9 px-3"
                          type="button"
                          onClick={() => {
                            if (idx === features.length - 1) return;
                            setFeatures((prev) => {
                              const next = [...prev];
                              [next[idx + 1], next[idx]] = [
                                next[idx],
                                next[idx + 1],
                              ];
                              return next;
                            });
                          }}
                        >
                          ↓
                        </Button>
                        <Button
                          variant="danger"
                          className="h-9"
                          type="button"
                          onClick={() => {
                            setFeatures((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                            notify("info", "Specs dihapus", f);
                          }}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-white/50">
                  Tambahkan poin detail seperti kapasitas, material, daya, dll.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <div>
              <div className="mb-1 text-xs text-white/70">
                Gambar Produk (PNG/JPG/JPEG/WEBP)
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className={clsx(
                  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none",
                  "file:mr-3 file:rounded-xl file:border file:border-white/10 file:bg-white/10 file:px-3 file:py-1 file:text-xs file:text-white/90",
                  "hover:bg-white/7"
                )}
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setImageFile(f);
                  if (f) notify("info", "Gambar dipilih", f.name);
                }}
              />

              {form.image_url || previewUrl ? (
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                  <img
                    src={previewUrl ? previewUrl : (form.image_url as string)}
                    alt="preview"
                    className="h-52 w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/50">
                  Belum ada gambar. (Boleh kosong, tapi lebih bagus kalau ada.)
                </div>
              )}

              <div className="mt-2 text-[11px] text-white/50">
                {mode === "edit"
                  ? "Kosongkan jika tidak ingin mengganti gambar."
                  : "Pilih gambar untuk tampil di katalog."}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/60">Preview Harga</div>
              <div className="mt-1 text-lg font-semibold">
                {rupiah(nnum(form.price))}
              </div>
              <div className="mt-2 text-[11px] text-white/50">
                Jangan lupa set “Rekomendasi” biar muncul di homepage.
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirm delete */}
      <ConfirmModal
        open={confirmDel.open}
        title={deleting ? "Menghapus..." : "Hapus produk?"}
        desc={`Produk "${confirmDel.title ?? ""}" akan dihapus permanen.`}
        danger
        confirmText={deleting ? "Menghapus..." : "Ya, hapus"}
        onClose={() => (deleting ? null : setConfirmDel({ open: false }))}
        onConfirm={del}
      />
    </div>
  );
}

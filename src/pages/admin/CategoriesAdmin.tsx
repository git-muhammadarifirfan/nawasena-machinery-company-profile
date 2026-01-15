import React, { useEffect, useMemo, useState } from "react";
import type { Category } from "../../lib/types";
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminUpdateCategory,
  listCategories,
} from "../../lib/db";
import { Card, CardBody } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { useToast } from "../../ui/Toast";
import { Modal, ConfirmModal } from "../../ui/Modal";
import { Plus, Search, Pencil, Trash2, RefreshCw } from "lucide-react";

export default function CategoriesAdmin() {
  const toast = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [q, setQ] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [draftName, setDraftName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [confirmDel, setConfirmDel] = useState<{ open: boolean; id?: string; name?: string }>({ open: false });

  async function load() {
    setLoading(true);
    try {
      setItems(await listCategories());
    } catch (err: any) {
      toast.push({ kind: "err", title: "Gagal memuat", desc: err?.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((x) => (x.name ?? "").toLowerCase().includes(s));
  }, [items, q]);

  function resetForm() {
    setMode("create");
    setEditingId(null);
    setDraftName("");
  }

  function openCreate() {
    resetForm();
    setMode("create");
    setOpenForm(true);
  }

  function openEdit(c: Category) {
    setMode("edit");
    setEditingId(c.id);
    setDraftName(c.name ?? "");
    setOpenForm(true);
  }

  function closeForm() {
    if (saving) return;
    setOpenForm(false);
    // optional: reset biar saat buka lagi bersih
    resetForm();
  }

  async function save() {
    const name = draftName.trim();
    if (!name) {
      toast.push({ kind: "err", title: "Nama wajib diisi" });
      return;
    }
    if (saving) return;

    setSaving(true);
    try {
      if (mode === "create") {
        await adminCreateCategory(name);
        toast.push({ kind: "ok", title: "Berhasil", desc: "Kategori berhasil ditambahkan." });
      } else if (editingId) {
        await adminUpdateCategory(editingId, name);
        toast.push({ kind: "ok", title: "Berhasil", desc: "Kategori berhasil diupdate." });
      }
      setOpenForm(false);
      resetForm();
      await load();
    } catch (err: any) {
      toast.push({ kind: "err", title: "Gagal simpan", desc: err?.message });
    } finally {
      setSaving(false);
    }
  }

  async function del() {
    const id = confirmDel.id;
    if (!id) return;

    try {
      await adminDeleteCategory(id);
      toast.push({ kind: "ok", title: "Berhasil", desc: "Kategori berhasil dihapus." });
      setConfirmDel({ open: false });
      await load();
    } catch (err: any) {
      toast.push({ kind: "err", title: "Gagal hapus", desc: err?.message });
    }
  }

  const canSave = draftName.trim().length > 0 && !saving;

  return (
    <div className="grid gap-4">
      <Card>
        <CardBody>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-semibold">Kategori</div>
              <div className="mt-1 text-xs text-white/60">
                Dipakai untuk filter katalog. Tambah/Edit pakai modal biar nyaman di mobile.
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-[280px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kategori…" className="pl-10" />
              </div>

              <Button variant="ghost" onClick={load} className="h-10" type="button">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>

              {/* Tombol Tambah warna hijau */}
              <Button
                onClick={openCreate}
                className="h-10 bg-emerald-500 text-black hover:bg-emerald-400"
                type="button"
              >
                <Plus className="h-4 w-4" />
                Tambah
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          {loading ? (
            <div className="text-white/60">Memuat…</div>
          ) : filtered.length === 0 ? (
            <div className="text-white/60">{items.length === 0 ? "Belum ada kategori." : "Tidak ada hasil pencarian."}</div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-4 hover:bg-white/7 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{c.name}</div>
                      <div className="mt-1 text-[11px] text-white/50">ID: {c.id}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" className="h-9 px-3" onClick={() => openEdit(c)} type="button">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        className="h-9 px-3"
                        onClick={() => setConfirmDel({ open: true, id: c.id, name: c.name })}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal tambah/edit */}
      <Modal
        open={openForm}
        title={mode === "create" ? "Tambah Kategori" : "Edit Kategori"}
        onClose={closeForm}
        footer={
          <>
            <Button variant="ghost" onClick={closeForm} type="button" disabled={saving}>
              Batal
            </Button>
            <Button onClick={save} type="button" disabled={!canSave}>
              {saving ? "Menyimpan…" : "Simpan"}
            </Button>
          </>
        }
      >
        <div
          className="grid gap-3"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              save();
            }
          }}
        >
          <div>
            <div className="mb-1 text-xs text-white/70">Nama Kategori *</div>
            <Input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Contoh: Mesin Kemasan"
              autoFocus
            />
          </div>
          <div className="text-[11px] text-white/50">Kategori dipakai untuk filter di halaman katalog.</div>
        </div>
      </Modal>

      {/* Confirm hapus */}
      <ConfirmModal
        open={confirmDel.open}
        title="Hapus kategori?"
        desc={`Kategori "${confirmDel.name ?? ""}" akan dihapus permanen.`}
        danger
        confirmText="Ya, hapus"
        onClose={() => setConfirmDel({ open: false })}
        onConfirm={del}
      />
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Modal, ConfirmModal } from "../../ui/Modal";
import { useToast } from "../../ui/Toast";
import { adminListAdmins } from "../../lib/db";
import { supabase } from "../../lib/supabase";
import { Plus, RefreshCw, Shield, Trash2 } from "lucide-react";

const ENABLE_INVITE =
  String(import.meta.env.VITE_ENABLE_INVITE_FUNCTION || "0") === "1";

function fmtID(dt?: string) {
  if (!dt) return "-";
  const d = new Date(dt);
  return isNaN(d.getTime()) ? "-" : d.toLocaleString("id-ID");
}

export default function UsersAdmin() {
  const toast = useToast();

  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // modal create
  const [openCreate, setOpenCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // optional: revoke UI (kalau kamu belum punya delete flow, biarin false / hapus block ini)
  const [openRevoke, setOpenRevoke] = useState(false);
  const [target, setTarget] = useState<any | null>(null);

  async function load() {
    setLoading(true);
    try {
      setAdmins(await adminListAdmins());
    } catch (err: any) {
      toast.push({ kind: "err", title: "Gagal memuat admin", desc: err?.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = useMemo(() => {
    return email.trim().length > 3 && password.trim().length >= 6 && !saving;
  }, [email, password, saving]);

  async function createAdmin() {
    if (!ENABLE_INVITE) {
      toast.push({
        kind: "err",
        title: "Edge Function belum aktif",
        desc: "Deploy invite-admin lalu set VITE_ENABLE_INVITE_FUNCTION=1.",
      });
      return;
    }

    if (!email.trim() || !password.trim()) {
      toast.push({
        kind: "err",
        title: "Lengkapi form",
        desc: "Email & password wajib diisi.",
      });
      return;
    }

    setSaving(true);
    try {
      // invoke will auto attach Authorization (current session) in most setups
      const { data, error } = await supabase.functions.invoke("invite-admin", {
        body: { email: email.trim(), password: password.trim() },
      });

      if (error) throw new Error(error.message || "Gagal memanggil function.");
      if (!data?.ok) throw new Error(data?.error || "Gagal membuat admin.");

      toast.push({
        kind: "ok",
        title: "Admin dibuat",
        desc: `Berhasil: ${email.trim()}`,
      });

      setOpenCreate(false);
      setEmail("");
      setPassword("");
      await load();
    } catch (err: any) {
      toast.push({
        kind: "err",
        title: "Gagal tambah admin",
        desc: err?.message ?? "Failed to fetch / CORS / auth error.",
      });
    } finally {
      setSaving(false);
    }
  }

  // NOTE: revoke admin butuh endpoint server-side juga (edge function) kalau mau sekalian hapus auth user.
  // Kalau belum ada, mending hide tombol ini dulu.
  async function revokeAdmin() {
    setOpenRevoke(false);
    toast.push({
      kind: "err",
      title: "Belum diaktifkan",
      desc: "Fitur hapus/revoke admin butuh Edge Function khusus (revoke-admin).",
    });
  }

  return (
    <div className="grid gap-4">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-base font-semibold text-white">Manajemen Admin</div>
          <div className="mt-0.5 text-xs text-white/60">
            Tambah admin via Supabase Edge Function (server-side) agar aman.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="h-10"
            onClick={load}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button className="h-10" onClick={() => setOpenCreate(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Admin
          </Button>
        </div>
      </div>

      {/* warning when function off */}
      {!ENABLE_INVITE ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-[12px] text-amber-100/90">
          <b>Invite function belum aktif.</b> Deploy <code>invite-admin</code> lalu set{" "}
          <b>VITE_ENABLE_INVITE_FUNCTION=1</b>.
        </div>
      ) : null}

      {/* list */}
      <Card>
        <CardBody>
          {loading ? (
            <div className="text-white/60">Memuat…</div>
          ) : admins.length === 0 ? (
            <div className="text-white/60">Belum ada admin.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {admins.map((a) => (
                <div
                  key={a.user_id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Shield className="h-4 w-4 text-emerald-400" />
                        Admin
                      </div>
                      <div className="mt-2 text-[11px] text-white/50">User ID</div>
                      <div className="mt-1 break-all font-mono text-[12px] text-white/75">
                        {a.user_id}
                      </div>
                      <div className="mt-2 text-[11px] text-white/45">
                        Added: {fmtID(a.created_at)}
                      </div>
                    </div>

                    {/* optional revoke */}
                    <Button
                      variant="ghost"
                      className="h-9 w-9 shrink-0"
                      title="Revoke (opsional)"
                      onClick={() => {
                        setTarget(a);
                        setOpenRevoke(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-white/70" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create modal */}
      <Modal
        open={openCreate}
        title="Tambah Admin Baru"
        onClose={() => (!saving ? setOpenCreate(false) : null)}
        footer={
          <div className="flex w-full items-center gap-2">
            <Button
              variant="ghost"
              className="h-11 flex-1"
              onClick={() => setOpenCreate(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button className="h-11 flex-1" onClick={createAdmin} disabled={!canSubmit}>
              {saving ? "Menyimpan…" : "Buat Admin"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="text-xs text-white/60">
            Admin dibuat di server via <b>Edge Function</b>. Pastikan function sudah deploy dan CORS sudah benar.
          </div>

          <div>
            <div className="mb-1 text-xs text-white/70">Email</div>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin2@nawasena.id"
              type="email"
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-white/70">Password</div>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="minimal 6 karakter"
              type="password"
            />
            <div className="mt-1 text-[11px] text-white/45">
              Tips: pakai password kuat (min 10 char + angka).
            </div>
          </div>
        </div>
      </Modal>

      {/* Revoke confirm (opsional) */}
      <ConfirmModal
        open={openRevoke}
        title="Cabut Akses Admin?"
        desc={
          target
            ? `User ID: ${target.user_id}`
            : "Admin ini akan dicabut aksesnya."
        }
        confirmText="Cabut"
        onClose={() => setOpenRevoke(false)}
        onConfirm={revokeAdmin}
      />
    </div>
  );
}

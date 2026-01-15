import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "../ui/Container";
import { Card, CardBody } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input, Textarea } from "../ui/Input";
import { useCart } from "../state/cart";
import { getSettings, createInquiry } from "../lib/db";
import { rupiah, clsx } from "../ui/format";
import { useToast } from "../ui/Toast";
import type { Inquiry } from "../lib/types";
import { MessageCircle, ArrowLeft, ShieldCheck, ClipboardList } from "lucide-react";

function normalizePhone(input: string) {
  const digits = (input || "").replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("8")) return "62" + digits;
  return digits;
}

function SkeletonBox() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-white/10" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-10/12 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const toast = useToast();

  const [adminWa, setAdminWa] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const s = await getSettings("admin_whatsapp");
        setAdminWa(normalizePhone(s.value));
      } catch {
        setAdminWa("6281234567890");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const itemsText = useMemo(() => {
    return items
      .map((x, i) => `${i + 1}. ${x.product.title} (x${x.qty}) - ${rupiah(Number(x.product.price))}`)
      .join("\n");
  }, [items]);

  const inquiryId = useMemo(
    () => `#${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
    []
  );

  const message = useMemo(() => {
    return [
      "Halo Admin Nawasena, saya ingin pesan/bertanya mesin:",
      "",
      `Nama: ${customerName || "-"}`,
      `No. WhatsApp: ${whatsapp || "-"}`,
      `Nama Usaha/UMKM: ${businessName || "-"}`,
      `Lokasi (Kota/Provinsi): ${location || "-"}`,
      "",
      "Mesin yang diminati:",
      itemsText || "-",
      "",
      `Catatan: ${notes || "-"}`,
      "",
      `Estimasi Total: ${rupiah(subtotal)}`,
      `ID Inquiry: ${inquiryId}`
    ].join("\n");
  }, [customerName, whatsapp, businessName, location, notes, itemsText, subtotal, inquiryId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (items.length === 0) {
      toast.push({ kind: "err", title: "Cart kosong", desc: "Silakan pilih mesin dulu." });
      return;
    }
    if (!customerName.trim() || !whatsapp.trim() || !location.trim()) {
      toast.push({ kind: "err", title: "Lengkapi form", desc: "Nama, No. WhatsApp, dan Lokasi wajib diisi." });
      return;
    }

    const admin = adminWa || "6281234567890";
    setSubmitting(true);

    try {
      const payload: Omit<Inquiry, "id" | "created_at"> = {
        status: "new",
        customer_name: customerName.trim(),
        whatsapp: whatsapp.trim(),
        business_name: businessName.trim() || null,
        location: location.trim(),
        notes: notes.trim() || null,
        items: items.map((x) => ({
          id: x.product.id,
          title: x.product.title,
          price: Number(x.product.price),
          qty: x.qty
        }))
      };

      await createInquiry(payload);

      const url = `https://wa.me/${admin}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");

      toast.push({ kind: "ok", title: "Berhasil", desc: "WhatsApp terbuka dengan pesan otomatis." });
      clear();
    } catch (err: any) {
      toast.push({ kind: "err", title: "Gagal mengirim", desc: err?.message ?? "Coba lagi." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative">
      {/* header */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <Container className="py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                <ClipboardList className="h-3.5 w-3.5" />
                Checkout
              </div>
              <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Form Pemesanan</h1>
              <p className="mt-1 text-sm text-white/60">
                Isi data singkat. Setelah submit, kamu akan diarahkan ke WhatsApp admin.
              </p>
            </div>

            <div className="flex gap-2">
              <Link to="/cart">
                <Button variant="ghost" className="h-11 px-5">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Cart
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-10">
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <SkeletonBox />
            <SkeletonBox />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            {/* form */}
            <Card>
              <CardBody className="p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-white">Data Pemesan</div>
                    <div className="mt-1 text-xs text-white/60">
                      Wajib: Nama, WhatsApp, Lokasi
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Aman & cepat
                  </div>
                </div>

                <form className="mt-5 space-y-4" onSubmit={onSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-1 text-xs text-white/70">Nama Lengkap *</div>
                      <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Contoh: Arif"
                      />
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-white/70">No. WhatsApp *</div>
                      <Input
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="Contoh: 08xxxx / 628xxxx"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-1 text-xs text-white/70">Nama Usaha / UMKM</div>
                      <Input
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Contoh: Mager Coffee Lab"
                      />
                    </div>
                    <div>
                      <div className="mb-1 text-xs text-white/70">Lokasi (Kota/Provinsi) *</div>
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Contoh: Malang, Jawa Timur"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs text-white/70">Catatan Khusus</div>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: butuh kapasitas 200 kg/jam, listrik 220V, dll…"
                    />
                  </div>

                  <Button
                    type="submit"
                    className={clsx("h-11 w-full")}
                    disabled={submitting || items.length === 0}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    {submitting ? "Mengirim…" : "Kirim ke WhatsApp Admin"}
                  </Button>

                  <div className="text-[11px] text-white/50">
                    Nomor admin dari Settings:{" "}
                    <span className="text-white/70">{adminWa || "-"}</span>
                  </div>
                </form>
              </CardBody>
            </Card>

            {/* summary */}
            <div className="space-y-4 lg:sticky lg:top-20 h-fit">
              <Card>
                <CardBody className="p-5">
                  <div className="text-sm font-semibold text-white">Ringkasan Mesin</div>

                  <div className="mt-3 space-y-3 text-sm">
                    {items.length === 0 ? (
                      <div className="text-white/60">
                        Cart kosong. <Link className="text-white hover:underline" to="/katalog">Lihat katalog</Link>.
                      </div>
                    ) : (
                      items.map((x) => (
                        <div key={x.product.id} className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                          <div className="min-w-0">
                            <div className="truncate font-medium text-white">{x.product.title}</div>
                            <div className="text-xs text-white/60">Qty: {x.qty}</div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="font-semibold text-white">{rupiah(Number(x.product.price))}</div>
                            <div className="text-xs text-white/60">
                              {rupiah(Number(x.product.price) * x.qty)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-white/60">Estimasi Total</div>
                      <div className="text-lg font-semibold text-white">{rupiah(subtotal)}</div>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-100">
                      Setelah klik “Kirim”, WhatsApp akan terbuka dengan pesan otomatis. Tinggal kirim.
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-5">
                  <div className="text-sm font-semibold text-white">Yang dikirim ke admin</div>
                  <div className="mt-2 text-xs text-white/60">
                    Nama, WhatsApp, lokasi, daftar mesin + qty, catatan, dan ID inquiry.
                  </div>
                  <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-[11px] leading-relaxed text-white/60">
                    ID Inquiry: <span className="text-white/80">{inquiryId}</span>
                    <br />
                    Admin akan konfirmasi detail & penawaran.
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Container } from "../ui/Container";
import { clsx } from "../ui/format";
import { useSiteSettings } from "../state/siteSettings";
import { ShoppingCart, MessageCircle, PackageSearch, BadgeCheck, Wrench, Truck } from "lucide-react";

function splitName(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { a: name || "Nawasena", b: "" };
  return { a: parts[0], b: parts.slice(1).join(" ") };
}

function Card({
  title,
  desc,
  icon
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-zinc-950/60 text-white/90">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-white/65">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  desc
}: {
  n: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="relative rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start gap-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-sm font-semibold text-emerald-300">
          {n}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-white/65">{desc}</div>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  const { settings } = useSiteSettings();

  const siteName = settings.site_name || "Nawasena Machinery";
  const { a, b } = useMemo(() => splitName(siteName), [siteName]);

  const aboutTitle = settings.about_title || "Tentang Kami";
  const aboutText =
    settings.about_text ||
    "Nawasena Machinery adalah produsen mesin yang fokus mendukung pertumbuhan UMKM hingga industri. Kami merancang dan memproduksi berbagai mesin tepat guna yang membantu proses produksi menjadi lebih efektif, konsisten, dan siap bersaing di pasar.";

  return (
    <div className="relative">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/10">
        {/* background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-64 w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -bottom-28 left-1/2 h-64 w-[900px] -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        </div>

        <Container className="relative py-12 md:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Profil & Alur Pemesanan
            </div>

            <h1 className="mt-4 text-3xl font-semibold leading-tight text-white md:text-5xl">
              <span>{aboutTitle}</span>
              <span className="text-emerald-400">.</span>
            </h1>

            <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-white/70 md:text-base">
              {aboutText}
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link
                to="/katalog"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                <PackageSearch size={18} />
                Lihat Katalog
              </Link>

              <Link
                to="/cart"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15"
              >
                <ShoppingCart size={18} />
                Buka Cart
              </Link>
            </div>

            {/* brand line */}
            <div className="mt-6 text-xs text-white/50">
              <span className="text-white/70">Brand:</span>{" "}
              <span className="font-semibold text-white">{a}</span>{" "}
              <span className="font-semibold text-emerald-300">{b}</span>
            </div>
          </div>
        </Container>
      </div>

      {/* Value props */}
      <Container className="py-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white md:text-2xl">
                Kenapa <span className="text-emerald-400">Nawasena</span>?
              </h2>
              <p className="mt-1 text-sm text-white/60">
                Fokus pada kualitas, ketepatan fungsi, dan support jangka panjang.
              </p>
            </div>
            <div className="hidden text-xs text-white/40 md:block">
              Material & komponen yang teruji • Build kuat • Bisa custom
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Card
              title="Desain matang"
              desc="Dirancang sesuai kebutuhan usaha agar hasil produksi lebih konsisten dan efisien."
              icon={<BadgeCheck size={18} />}
            />
            <Card
              title="Build kuat"
              desc="Material berkualitas, komponen andal, mudah perawatan, dan tahan dipakai harian."
              icon={<Wrench size={18} />}
            />
            <Card
              title="Bisa custom"
              desc="Spesifikasi dapat disesuaikan: kapasitas, ukuran, fitur, dan kebutuhan produksi."
              icon={<Truck size={18} />}
            />
          </div>
        </div>
      </Container>

      {/* Checkout steps */}
      <div className="border-y border-white/10 bg-white/[0.02]">
        <Container className="py-10">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-semibold text-white md:text-2xl">
              Cara <span className="text-emerald-400">Checkout</span>
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/65">
              Sistem pemesanan tanpa payment gateway. Setelah checkout, kamu akan diarahkan ke WhatsApp admin dengan format pesan otomatis—tinggal kirim.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <Step
                n={1}
                title="Pilih mesin di Katalog"
                desc="Gunakan filter kategori dan urutkan harga untuk menemukan mesin yang sesuai kebutuhan produksi."
              />
              <Step
                n={2}
                title="Tambah ke Cart"
                desc="Klik tombol Tambah. Kamu bisa menambah beberapa mesin sekaligus untuk ditanyakan atau dipesan."
              />
              <Step
                n={3}
                title="Isi catatan & kebutuhan"
                desc="Di cart, tambahkan catatan seperti kapasitas, lokasi, atau kebutuhan instalasi agar admin cepat memahami."
              />
              <Step
                n={4}
                title="Checkout → WhatsApp terbuka"
                desc="Klik Checkout, otomatis membuka WhatsApp admin dengan format pesan. Tinggal kirim untuk proses penawaran/pemesanan."
              />
            </div>

            {/* Example message */}
            <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-950/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">Contoh format pesan</div>
                  <div className="mt-2 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-white/70">
{`Halo Admin ${a}${b ? " " + b : ""}, saya (Nama Anda).
Saya ingin pesan/bertanya mesin:

- Mesin: (Nama Mesin)
- Qty: (Jumlah)
- Lokasi: (Kota/Alamat singkat)
- Catatan: (Kapasitas/Spesifikasi yang dibutuhkan)

Terima kasih.`}
                  </div>
                </div>

                <div className="hidden md:block">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/80">
                    <MessageCircle size={18} />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  to="/katalog"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                >
                  <PackageSearch size={18} />
                  Mulai dari Katalog
                </Link>
                <Link
                  to="/cart"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/15"
                >
                  <ShoppingCart size={18} />
                  Lanjut ke Cart
                </Link>
              </div>

              <div className="mt-3 text-xs text-white/45">
                Tip: jika WhatsApp tidak terbuka, pastikan browser mengizinkan pop-up atau gunakan tombol checkout sekali lagi.
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* FAQ mini */}
      <Container className="py-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-semibold text-white md:text-2xl">
            Pertanyaan yang sering ditanya
          </h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white">Apakah bisa request spesifikasi?</div>
              <div className="mt-1 text-sm text-white/65">
                Bisa. Tulis kebutuhan di catatan cart (kapasitas, ukuran, bahan, target output), lalu kirim via WhatsApp.
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white">Apakah harga bisa berubah?</div>
              <div className="mt-1 text-sm text-white/65">
                Harga di katalog sebagai acuan. Admin akan konfirmasi harga final, opsi custom, dan estimasi pengerjaan/pengiriman.
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

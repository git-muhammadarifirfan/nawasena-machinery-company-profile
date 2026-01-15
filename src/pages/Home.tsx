import React, { useEffect, useMemo, useState } from "react";
import { Container } from "../ui/Container";
import { Button } from "../ui/Button";
import { Link } from "react-router-dom";
import { listProducts } from "../lib/db";
import type { Product } from "../lib/types";
import { ProductCard } from "../components/ProductCard";
import { useSiteSettings } from "../state/siteSettings";

function SplitTitle({ a, b }: { a: string; b: string }) {
  return (
    <div className="text-sm font-semibold tracking-tight">
      <span className="text-white">{a}</span>{" "}
      <span className="text-emerald-400">{b}</span>
    </div>
  );
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={[
        "opacity-0 translate-y-2 animate-[fadeUp_.65s_ease-out_forwards]",
        className,
      ].join(" ")}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { settings } = useSiteSettings();
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const siteNameRaw = (settings.site_name || "Nawasena Machinery").trim();
  const parts = siteNameRaw.split(/\s+/);
  const last = parts.pop() || "";
  const first = parts.join(" ");
  const heroDesc = useMemo(() => {
    const t = settings.about_text?.trim();
    return t
      ? t
      : "Kami merancang dan memproduksi mesin tepat guna agar proses produksi lebih efektif, konsisten, dan siap bersaing. Material berkualitas, fungsi terpakai di lapangan, dan dukungan jangka panjang.";
  }, [settings.about_text]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const items = await listProducts({ recommendedOnly: true });
        setRecommended(items.slice(0, 6));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="pb-6">
      {/* Anim keyframes (global-in-component) */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-30%); opacity: .0; }
          25% { opacity: .35; }
          100% { transform: translateX(30%); opacity: .0; }
        }
      `}</style>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        {/* Background */}
        <div className="absolute inset-0 bg-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_15%,rgba(16,185,129,.20),transparent_60%),radial-gradient(900px_circle_at_90%_30%,rgba(59,130,246,.12),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:40px_40px]" />

        <Container className="relative py-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            {/* Left */}
            <div className="lg:col-span-7">
              <FadeIn delay={0}>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,.12)]" />
                  Produsen mesin tepat guna untuk UMKM & industri
                </div>
              </FadeIn>

              <FadeIn delay={90}>
                <div className="mt-5">
                  <h1 className="text-3xl font-bold leading-[1.1] md:text-5xl">
                    <span className="text-white">
                      {first ? `${first} ` : ""}
                    </span>
                    <span className="text-emerald-400">{last}</span>
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">
                    {heroDesc}
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={180}>
                <div className="mt-7 flex flex-wrap items-center gap-2">
                  <Link to="/katalog">
                    <Button className="h-11 px-6">Lihat Katalog</Button>
                  </Link>
                  <Link to="/tentang">
                    <Button variant="ghost" className="h-11 px-6">
                      Tentang Kami
                    </Button>
                  </Link>
                </div>
              </FadeIn>

              {/* Quick stats */}
              <FadeIn delay={260}>
                <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                  {[
                    {
                      a: "Support",
                      b: "Responsif",
                      d: "Fast response via WA.",
                    },
                    { a: "Build", b: "Kuat", d: "Material & komponen andal." },
                    { a: "Bisa", b: "Custom", d: "Kapasitas & spek sesuai." },
                  ].map((x) => (
                    <div
                      key={x.a + x.b}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.06] transition-colors"
                    >
                      <SplitTitle a={x.a} b={x.b} />
                      <div className="mt-1 text-xs text-white/60">{x.d}</div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            {/* Right */}
            <div className="lg:col-span-5">
              <FadeIn delay={140} className="relative">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6">
                  {/* soft shimmer */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -inset-x-20 -top-10 h-24 rotate-6 bg-white/10 blur-xl animate-[shimmer_5s_ease-in-out_infinite]" />
                  </div>

                  <div className="flex items-center justify-between">
                    <SplitTitle a="Kenapa" b="Nawasena?" />
                    <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] text-white/60">
                      Highlight
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {[
                      {
                        t: "Desain matang",
                        d: "Dirancang sesuai kebutuhan usaha, hasil konsisten.",
                      },
                      {
                        t: "Material berkualitas",
                        d: "Komponen andal, mudah perawatan & tahan lama.",
                      },
                      {
                        t: "Custom kebutuhan",
                        d: "Bisa disesuaikan kapasitas, ukuran, dan spesifikasi.",
                      },
                      {
                        t: "After-sales",
                        d: "Panduan pemakaian & dukungan jangka panjang.",
                      },
                    ].map((x, i) => (
                      <div
                        key={x.t}
                        className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition-all hover:-translate-y-[1px] hover:bg-black/30"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400/90 shadow-[0_0_0_4px_rgba(16,185,129,.10)]" />
                          <div>
                            <div className="text-sm font-semibold">{x.t}</div>
                            <div className="mt-1 text-xs leading-relaxed text-white/60">
                              {x.d}
                            </div>
                          </div>
                        </div>

                        {/* subtle divider that appears */}
                        <div className="mt-4 h-px w-full bg-white/0 group-hover:bg-white/10 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </Container>
      </section>

      {/* RECOMMENDED */}
      <section className="py-10 md:py-12">
        <Container>
          <FadeIn delay={0}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SplitTitle a="Rekomendasi" b="Produk" />
                <p className="mt-1 max-w-2xl text-sm text-white/60">
                  Produk pilihan dari kami untuk mendukung kebutuhan produksi
                  Anda.
                </p>
              </div>

              <Link
                to="/katalog"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                Lihat semua
              </Link>
            </div>
          </FadeIn>

          <div className="mt-6">
            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
                Memuat rekomendasi…
              </div>
            ) : recommended.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
                Belum ada rekomendasi. Pilih produk di Admin Panel lalu aktifkan
                sebagai rekomendasi.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.map((p, idx) => (
                  <FadeIn key={p.id} delay={60 + idx * 60}>
                    <div className="transition-transform hover:-translate-y-[1px]">
                      <ProductCard p={p} />
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Container } from "../ui/Container";
import { getProduct } from "../lib/db";
import type { Product } from "../lib/types";
import { rupiah, clsx } from "../ui/format";
import { Button } from "../ui/Button";
import { useCart } from "../state/cart";
import { ArrowLeft, ShoppingCart, PackageCheck, Tag } from "lucide-react";

function SkeletonDetail() {
  return (
    <Container className="py-10">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-9 w-24 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="aspect-[16/12] animate-pulse bg-white/10" />
        </div>

        <div className="space-y-3">
          <div className="h-7 w-2/3 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
          <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-white/10" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-10/12 animate-pulse rounded bg-white/10" />
          </div>
          <div className="mt-5 flex gap-2">
            <div className="h-11 flex-1 animate-pulse rounded-2xl bg-white/10" />
            <div className="h-11 flex-1 animate-pulse rounded-2xl bg-white/10" />
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        setP(await getProduct(id));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const price = useMemo(() => Number(p?.price || 0), [p]);

  if (loading) return <SkeletonDetail />;

  if (!p)
    return (
      <div className="min-h-[60vh] grid place-items-center text-white/60">
        Produk tidak ditemukan.
      </div>
    );

  return (
    <div className="relative">
      {/* header */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <Container className="py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm text-white/60">
                <Link to="/katalog" className="hover:text-white">
                  Katalog
                </Link>{" "}
                <span className="text-white/30">/</span>{" "}
                <span className="text-white/80">{p.title}</span>
              </div>

              <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                {p.title}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
                  <Tag className="h-4 w-4 text-white/50" />
                  {p.category?.name ?? "Tanpa Kategori"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-200">
                  {rupiah(price)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link to="/katalog">
                <Button variant="ghost" className="h-11 px-5">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
              </Link>

              <Link to="/cart">
                <Button className="h-11 px-5">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Lihat Cart
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-10">
        <div className="grid gap-6 md:grid-cols-2">
          {/* image */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="aspect-[16/12] bg-black/30">
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/30">
                  No Image
                </div>
              )}
            </div>
          </div>

          {/* content */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white">Deskripsi</div>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/70">
                {p.description || "-"}
              </p>
            </div>

            {(p.features?.length ?? 0) > 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm font-semibold text-white">Fitur</div>
                <ul className="mt-3 space-y-2 text-sm text-white/70">
                  {p.features!.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => add(p, 1)}
                className={clsx("h-11 px-5", "w-full sm:w-auto")}
              >
                <PackageCheck className="mr-2 h-4 w-4" />
                Tambah ke Cart
              </Button>

              <Link className="w-full sm:w-auto" to="/cart">
                <Button variant="ghost" className="h-11 w-full px-5">
                  Lihat Cart
                </Button>
              </Link>
            </div>

            <div className="text-xs text-white/45">
              Tip: Tambahkan catatan kebutuhan (kapasitas/output/lokasi) saat checkout.
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

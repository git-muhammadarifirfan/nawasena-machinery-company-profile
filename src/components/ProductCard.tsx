import React from "react";
import { Link } from "react-router-dom";
import type { Product } from "../lib/types";
import { Button } from "../ui/Button";
import { clsx } from "../ui/format";
import { useCart } from "../state/cart";

function formatIDR(v: any) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(isNaN(n) ? 0 : n);
}

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();

  const img =
    (p as any).image_url ||
    (p as any).imageUrl ||
    (p as any).thumbnail_url ||
    "";

  const id = String((p as any).id ?? "");
  const name = (p as any).name ?? (p as any).title ?? "Produk";
  const desc = (p as any).description ?? "";
  const price = Number((p as any).price ?? 0);
  const category =
    (p as any).category_name ||
    (p as any).categoryName ||
    (p as any).category?.name ||
    "";

  // IMPORTANT: normalize biar konsisten dengan ProductDetail (yang pakai p.title, p.image_url, dst)
  const normalized = {
    ...(p as any),
    id,
    title: (p as any).title ?? name,
    price,
    image_url: (p as any).image_url ?? img,
    category: (p as any).category ?? (category ? { name: category } : undefined),
  } as Product;

  return (
    <div
      className={clsx(
        "group overflow-hidden rounded-3xl border border-white/10 bg-white/5",
        "transition hover:-translate-y-[1px] hover:bg-white/[0.07]"
      )}
    >
      <div className="relative aspect-[16/10] w-full bg-black/20">
        {img ? (
          <img
            src={img}
            alt={name}
            className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-white/40">
            No Image
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

        {category ? (
          <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-white/70 backdrop-blur">
            {category}
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold tracking-tight text-white">{name}</div>
            {desc ? (
              <div className="mt-1 text-xs leading-relaxed text-white/60 line-clamp-2">{desc}</div>
            ) : (
              <div className="mt-1 text-xs text-white/40">—</div>
            )}
          </div>

          <div className="shrink-0 text-sm font-semibold text-emerald-400">
            {formatIDR(price)}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to={`/produk/${id}`} className="block">
            <Button variant="ghost" className="h-10 w-full">
              Detail
            </Button>
          </Link>

          <Button
            className="h-10 w-full"
            onClick={() => {
              if (!id) return;
              add(normalized, 1);
            }}
          >
            Tambah
          </Button>
        </div>
      </div>
    </div>
  );
}

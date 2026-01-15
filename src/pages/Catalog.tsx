import React, { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "../ui/Container";
import { listCategories, listProducts } from "../lib/db";
import type { Category, Product } from "../lib/types";
import { ProductCard } from "../components/ProductCard";
import { Search, RotateCcw, SlidersHorizontal } from "lucide-react";
import { clsx } from "../ui/format";
import { Select } from "../ui/Select"; // <-- pastikan path sesuai: kamu taruh Select di ../ui/Select
// kalau file select kamu ada di "../ui/select" atau lain, sesuaikan import

type Sort = "price_asc" | "price_desc" | "newest";

function normalize(str: string) {
  return (str || "").toLowerCase();
}

function sortProducts(products: Product[], sort: Sort) {
  const arr = [...products];
  if (sort === "price_asc") {
    arr.sort((a: any, b: any) => Number(a.price || 0) - Number(b.price || 0));
    return arr;
  }
  if (sort === "price_desc") {
    arr.sort((a: any, b: any) => Number(b.price || 0) - Number(a.price || 0));
    return arr;
  }
  // newest: kalau gak ada created_at, fallback id
  arr.sort((a: any, b: any) => {
    const da = a.created_at ? new Date(a.created_at).getTime() : Number(a.id || 0);
    const db = b.created_at ? new Date(b.created_at).getTime() : Number(b.id || 0);
    return db - da;
  });
  return arr;
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="h-40 w-full animate-pulse rounded-2xl bg-white/10" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-10 flex-1 animate-pulse rounded-2xl bg-white/10" />
        <div className="h-10 flex-1 animate-pulse rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}

export default function Catalog() {
  const [cats, setCats] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [categoryId, setCategoryId] = useState<string>("");
  const [sort, setSort] = useState<Sort>("newest");

  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");

  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const lastReq = useRef(0);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchDraft.trim()), 350);
    return () => clearTimeout(t);
  }, [searchDraft]);

  async function loadCategories() {
    setLoadingCats(true);
    try {
      const c = await listCategories();
      setCats(c);
    } finally {
      setLoadingCats(false);
    }
  }

  async function loadProducts(next: { categoryId: string; search: string }) {
    const reqId = Date.now();
    lastReq.current = reqId;
    setLoadingProducts(true);
    try {
      const p = await listProducts({
        categoryId: next.categoryId || undefined,
        search: next.search
      });

      // ignore outdated response
      if (lastReq.current !== reqId) return;

      setProducts(p);
    } finally {
      if (lastReq.current === reqId) setLoadingProducts(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  // auto reload products when filters change
  useEffect(() => {
    loadProducts({ categoryId, search });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, search]);

  const catName = useMemo(
    () => cats.find((x) => x.id === categoryId)?.name ?? "Semua Kategori",
    [cats, categoryId]
  );

  const filteredAndSorted = useMemo(() => {
    // karena listProducts udah menerima categoryId + search,
    // di sini kita fokus sort client-side biar stabil.
    return sortProducts(products, sort);
  }, [products, sort]);

  const catOptions = useMemo(() => {
    const base = [{ value: "", label: "Semua Kategori" }];
    return base.concat(cats.map((c) => ({ value: c.id, label: c.name })));
  }, [cats]);

  const sortOptions = useMemo(
    () => [
      { value: "newest", label: "Terbaru" },
      { value: "price_asc", label: "Harga Terendah" },
      { value: "price_desc", label: "Harga Tertinggi" }
    ],
    []
  );

  const activeCatId = categoryId;

  function resetAll() {
    setCategoryId("");
    setSort("newest");
    setSearchDraft("");
    setSearch("");
  }

  return (
    <div className="relative">
      {/* header section */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <Container className="py-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Katalog Produk
                </div>
                <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Katalog</h1>
                <p className="mt-1 text-sm text-white/60">
                  Cari produk, pilih kategori, dan urutkan harga.
                </p>
                <div className="mt-2 text-xs text-white/50">
                  Kategori: <span className="text-emerald-300">{catName}</span>
                </div>
              </div>

              {/* filter bar */}
              <div className="w-full max-w-xl">
                <div className="grid gap-2 md:grid-cols-[1fr_180px_170px]">
                  {/* search */}
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <Search className="h-4 w-4 text-white/50" />
                    <input
                      value={searchDraft}
                      onChange={(e) => setSearchDraft(e.target.value)}
                      placeholder="Cari mesin…"
                      className="w-full bg-transparent text-sm text-white/85 outline-none placeholder:text-white/30"
                    />
                    {searchDraft ? (
                      <button
                        onClick={() => setSearchDraft("")}
                        className="rounded-lg px-2 py-1 text-xs text-white/50 hover:bg-white/10 hover:text-white"
                        aria-label="Clear"
                      >
                        Clear
                      </button>
                    ) : null}
                  </div>

                  {/* category select (portal, gak kepotong) */}
                  <Select
                    value={categoryId}
                    onChange={setCategoryId}
                    options={catOptions}
                    placeholder={loadingCats ? "Memuat…" : "Pilih kategori"}
                    buttonClassName="h-[46px]"
                  />

                  {/* sort select */}
                  <Select
                    value={sort}
                    onChange={(v) => setSort(v as Sort)}
                    options={sortOptions as any}
                    placeholder="Urutkan"
                    buttonClassName="h-[46px]"
                  />
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="text-xs text-white/50">
                    {loadingProducts ? "Memuat produk…" : `${filteredAndSorted.length} produk`}
                  </div>

                  <button
                    onClick={resetAll}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>

                {/* quick category chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategoryId("")}
                    className={clsx(
                      "rounded-full border px-4 py-2 text-xs transition",
                      !activeCatId
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    Semua
                  </button>

                  {cats.slice(0, 8).map((c) => {
                    const active = c.id === activeCatId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setCategoryId(c.id)}
                        className={clsx(
                          "rounded-full border px-4 py-2 text-xs transition",
                          active
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                            : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* content */}
      <Container className="py-10">
        <div className="mx-auto max-w-6xl">
          {loadingProducts ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
              <div className="text-lg font-semibold text-white">Tidak ada produk</div>
              <div className="mt-2 text-sm text-white/60">
                Coba ganti kategori atau kata kunci pencarian.
              </div>
              <button
                onClick={resetAll}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4" />
                Reset filter
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSorted.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

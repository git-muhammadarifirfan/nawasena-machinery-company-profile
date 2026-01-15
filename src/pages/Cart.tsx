import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Container } from "../ui/Container";
import { useCart } from "../state/cart";
import { Card, CardBody } from "../ui/Card";
import { Button } from "../ui/Button";
import { clsx, rupiah } from "../ui/format";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, PackageSearch } from "lucide-react";

function QtyStepper({
  value,
  onDec,
  onInc
}: {
  value: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5">
      <button
        className="grid h-10 w-10 place-items-center rounded-l-2xl text-white/80 transition hover:bg-white/10"
        onClick={onDec}
        aria-label="kurangi"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="w-12 text-center text-sm font-semibold text-white">{value}</div>
      <button
        className="grid h-10 w-10 place-items-center rounded-r-2xl text-white/80 transition hover:bg-white/10"
        onClick={onInc}
        aria-label="tambah"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();

  const summary = useMemo(() => {
    const totalQty = items.reduce((a, b) => a + b.qty, 0);
    return { totalQty };
  }, [items]);

  return (
    <div className="relative">
      {/* header */}
      <div className="border-b border-white/10 bg-white/[0.02]">
        <Container className="py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                <ShoppingBag className="h-3.5 w-3.5" />
                Keranjang
              </div>
              <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">Cart</h1>
              <p className="mt-1 text-sm text-white/60">
                Pilih mesin yang ingin kamu tanyakan / pesan. Checkout akan mengarah ke WhatsApp admin.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/katalog">
                <Button className="h-11" variant="ghost">
                  <PackageSearch className="mr-2 h-4 w-4" />
                  Katalog
                </Button>
              </Link>
              <Link to="/checkout">
                <Button className="h-11" disabled={items.length === 0}>
                  Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-10">
        {items.length === 0 ? (
          <Card>
            <CardBody className="flex flex-col items-start gap-3 py-10">
              <div className="text-lg font-semibold text-white">Cart kosong</div>
              <div className="text-sm text-white/60">Yuk pilih mesin dulu dari katalog.</div>
              <Link to="/katalog" className="mt-2">
                <Button>
                  <PackageSearch className="mr-2 h-4 w-4" />
                  Buka Katalog
                </Button>
              </Link>
            </CardBody>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* items */}
            <div className="space-y-4">
              {items.map((it) => {
                const price = Number(it.product.price || 0);
                const lineTotal = price * it.qty;

                return (
                  <Card key={it.product.id}>
                    <CardBody className="p-4 md:p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                          <div className="h-20 w-28 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                            {it.product.image_url ? (
                              <img
                                src={it.product.image_url}
                                className="h-full w-full object-cover"
                                alt={it.product.title}
                                loading="lazy"
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center text-xs font-semibold text-white/40">
                                No Image
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-white">
                              {it.product.title}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <div className="text-xs text-white/60">{rupiah(price)}</div>
                              <span className="text-xs text-white/30">•</span>
                              <div className="text-xs text-emerald-300">Total: {rupiah(lineTotal)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="md:ml-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                          <QtyStepper
                            value={it.qty}
                            onDec={() => setQty(it.product.id, it.qty - 1)}
                            onInc={() => setQty(it.product.id, it.qty + 1)}
                          />

                          <Button
                            variant="danger"
                            className={clsx("h-10", "sm:ml-2")}
                            onClick={() => remove(it.product.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            {/* summary */}
            <div className="lg:sticky lg:top-20 h-fit space-y-4">
              <Card>
                <CardBody className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">Ringkasan</div>
                    <div className="text-xs text-white/50">{summary.totalQty} item</div>
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between text-white/70">
                      <span>Subtotal (estimasi)</span>
                      <span className="font-semibold text-white">{rupiah(subtotal)}</span>
                    </div>

                    <div className="h-px bg-white/10" />

                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-100">
                      Checkout akan membuka WhatsApp admin dengan pesan otomatis.
                      Kamu bisa tambahkan catatan kebutuhan di form checkout.
                    </div>

                    <Link to="/checkout">
                      <Button className="mt-1 h-11 w-full" disabled={items.length === 0}>
                        Checkout <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>

                    <Link to="/katalog" className="block">
                      <Button variant="ghost" className="h-11 w-full">
                        Tambah produk lain
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-5">
                  <div className="text-sm font-semibold text-white">Tips cepat</div>
                  <ul className="mt-3 space-y-2 text-sm text-white/65">
                    <li className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Tulis kapasitas/output yang kamu butuhkan saat checkout.
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Bisa menanyakan beberapa mesin sekaligus dalam satu pesan.
                    </li>
                  </ul>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

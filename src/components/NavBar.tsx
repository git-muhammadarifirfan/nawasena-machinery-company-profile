import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Container } from "../ui/Container";
import { clsx } from "../ui/format";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "../state/cart";
import { useSiteSettings } from "../state/siteSettings";

function splitName(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { a: name || "Nawasena", b: "" };
  // Putih: kata pertama, Hijau: sisanya (sesuai yang kamu mau)
  return { a: parts[0], b: parts.slice(1).join(" ") };
}

function NavItem({
  to,
  label,
  onClick,
  variant = "pill"
}: {
  to: string;
  label: string;
  onClick?: () => void;
  variant?: "pill" | "drawer";
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        clsx(
          variant === "pill"
            ? "rounded-2xl border px-4 py-2 text-sm transition"
            : "w-full rounded-2xl border px-4 py-3 text-sm transition",
          isActive
            ? "border-white/20 bg-white/10 text-white"
            : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
        )
      }
    >
      {label}
    </NavLink>
  );
}

function CartButton({ count, compact }: { count: number; compact?: boolean }) {
  return (
    <Link
      to="/cart"
      className={clsx(
        "relative inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white/80 transition hover:bg-white/10",
        compact && "px-3"
      )}
      aria-label="Buka cart"
    >
      <ShoppingCart size={18} />
      <span className="hidden sm:inline">Cart</span>
      {count > 0 ? (
        <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-xs">{count}</span>
      ) : null}
    </Link>
  );
}

export function NavBar() {
  const { count } = useCart();
  const { settings } = useSiteSettings();
  const { pathname } = useLocation();

  const { a, b } = useMemo(
    () => splitName(settings.site_name || "Nawasena Machinery"),
    [settings.site_name]
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);

  // close drawer saat pindah route
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // mount/unmount biar animasi halus
  useEffect(() => {
    if (drawerOpen) {
      setDrawerMounted(true);
      return;
    }
    const t = setTimeout(() => setDrawerMounted(false), 220);
    return () => clearTimeout(t);
  }, [drawerOpen]);

  // lock scroll saat drawer open
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  // close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    if (drawerOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-3">
        {/* Brand */}
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-xs font-semibold text-white/80">NM</div>
            )}
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight">
              <span className="text-white">{a}</span>
              {b ? (
                <>
                  {" "}
                  <span className="text-emerald-400">{b}</span>
                </>
              ) : null}
            </div>
          </div>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <NavItem to="/" label="Beranda" />
          <NavItem to="/katalog" label="Katalog" />
          <NavItem to="/tentang" label="Tentang Kami" />
          <CartButton count={count} />
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <CartButton count={count} compact />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 text-white/80 transition hover:bg-white/10"
            aria-label="Buka menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </Container>

      {/* Side Drawer (Mobile) */}
      {drawerMounted ? (
        <div className="md:hidden">
          {/* overlay */}
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Tutup menu"
            className={clsx(
              "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity",
              drawerOpen ? "opacity-100" : "opacity-0"
            )}
          />

          {/* panel */}
          <aside
            className={clsx(
              "fixed right-0 top-0 z-50 h-dvh w-[320px] max-w-[86vw] border-l border-white/10 bg-zinc-950 shadow-2xl transition-transform duration-200",
              drawerOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  <span className="text-white">{a}</span>{" "}
                  <span className="text-emerald-400">{b}</span>
                </div>
                <div className="truncate text-xs text-white/50">Menu</div>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {/* content */}
            <div className="p-4">
              <div className="grid gap-2">
                <NavItem to="/" label="Beranda" variant="drawer" onClick={() => setDrawerOpen(false)} />
                <NavItem to="/katalog" label="Katalog" variant="drawer" onClick={() => setDrawerOpen(false)} />
                <NavItem to="/tentang" label="Tentang Kami" variant="drawer" onClick={() => setDrawerOpen(false)} />

                <Link
                  to="/cart"
                  onClick={() => setDrawerOpen(false)}
                  className="mt-1 inline-flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10"
                >
                  <span className="inline-flex items-center gap-2">
                    <ShoppingCart size={18} />
                    Cart
                  </span>
                  {count > 0 ? (
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{count}</span>
                  ) : (
                    <span className="text-xs text-white/40">Kosong</span>
                  )}
                </Link>
              </div>

              <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
                <div className="font-semibold text-white/80">Checkout via WhatsApp</div>
                <div className="mt-1">Masuk cart → checkout → otomatis bikin format pesan ke admin.</div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

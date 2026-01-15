import React, { createContext, useContext, useMemo, useState } from "react";
import { clsx } from "./format";

export type ToastKind = "ok" | "err" | "info" | "warn";
type ToastItem = { id: string; kind: ToastKind; title: string; desc?: string };

type ToastCtx = {
  push: (t: Omit<ToastItem, "id">) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  function push(t: Omit<ToastItem, "id">) {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const item: ToastItem = { id, ...t };
    setItems((prev) => [item, ...prev].slice(0, 5));
    setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 3500);
  }

  const value = useMemo(() => ({ push }), []);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[999] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={clsx(
              "rounded-2xl border px-4 py-3 backdrop-blur",
              t.kind === "ok"
                ? "border-emerald-400/20 bg-emerald-400/10"
                : t.kind === "warn"
                ? "border-amber-400/20 bg-amber-400/10"
                : t.kind === "info"
                ? "border-sky-400/20 bg-sky-400/10"
                : "border-red-500/20 bg-red-500/10"
            )}
          >
            <div className="text-sm font-semibold text-white">{t.title}</div>
            {t.desc ? <div className="mt-1 text-xs text-white/70">{t.desc}</div> : null}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast must be used inside ToastProvider");
  return v;
}

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { clsx } from "./format";

export type SelectOption = { value: string; label: string };

type Placement = "bottom" | "top";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Pilih…",
  className,
  buttonClassName,
  menuClassName,
  maxMenuHeight = 320,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  maxMenuHeight?: number;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const [pos, setPos] = useState<{ left: number; top: number; width: number; placement: Placement }>({
    left: 0,
    top: 0,
    width: 0,
    placement: "bottom",
  });

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  function close() {
    setOpen(false);
  }

  function computePosition() {
    const btn = btnRef.current;
    if (!btn) return;

    const r = btn.getBoundingClientRect();
    const viewportH = window.innerHeight;

    // prefer bottom, but flip if near bottom
    const spaceBelow = viewportH - r.bottom;
    const spaceAbove = r.top;

    const placement: Placement =
      spaceBelow < 220 && spaceAbove > spaceBelow ? "top" : "bottom";

    const gap = 8;
    const top = placement === "bottom" ? r.bottom + gap : r.top - gap;

    // keep within viewport horizontally
    const width = r.width;
    const left = clamp(r.left, 8, Math.max(8, window.innerWidth - width - 8));

    setPos({ left, top, width, placement });
  }

  useLayoutEffect(() => {
    if (!open) return;
    computePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value, options.length]);

  useEffect(() => {
    if (!open) return;

    const onResize = () => computePosition();
    // capture scroll from any scrollable parent
    const onScroll = () => computePosition();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      const btn = btnRef.current;
      if (btn && btn.contains(t)) return; // clicking button handled separately
      // if click is inside menu, ignore (menu stops propagation)
      close();
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className={clsx("relative", className)}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={clsx(
          "h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4",
          "text-sm text-white/80 outline-none",
          "hover:bg-white/10 hover:border-white/20 transition",
          "flex items-center justify-between gap-3",
          open && "border-white/20 bg-white/10",
          buttonClassName
        )}
      >
        <span className={clsx(!value ? "text-white/50" : "text-white/85")}>
          {selected?.label ?? placeholder}
        </span>
        <span className={clsx("text-white/50 transition", open && "rotate-180")}>▾</span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999]"
            // prevent outer click from reaching document handler before we can stop it
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <style>{`
              @keyframes selIn {
                from { opacity: 0; transform: translateY(-4px) scale(.98); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes selInUp {
                from { opacity: 0; transform: translateY(4px) scale(.98); }
                to   { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>

            <div
              className={clsx(
                "fixed",
                "overflow-hidden rounded-2xl border border-white/10",
                "bg-zinc-950/95 backdrop-blur",
                "shadow-[0_20px_60px_-30px_rgba(0,0,0,.85)]",
                pos.placement === "bottom"
                  ? "origin-top animate-[selIn_.12s_ease-out_forwards]"
                  : "origin-bottom animate-[selInUp_.12s_ease-out_forwards]",
                menuClassName
              )}
              style={{
                left: pos.left,
                width: pos.width,
                // if placement top, we need translate Y by menu height; easiest: use bottom aligned via transform
                top: pos.placement === "bottom" ? pos.top : undefined,
                bottom:
                  pos.placement === "top"
                    ? window.innerHeight - (pos.top ?? 0)
                    : undefined,
                maxHeight: maxMenuHeight,
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <div className="p-1">
                {options.map((o) => {
                  const active = o.value === value;
                  return (
                    <button
                      key={o.value || "empty"}
                      type="button"
                      onClick={() => {
                        onChange(o.value);
                        close();
                      }}
                      className={clsx(
                        "w-full rounded-xl px-3 py-2 text-left text-sm transition",
                        active
                          ? "bg-white/10 text-white"
                          : "text-white/75 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

import React, { useEffect } from "react";
import { clsx } from "./format";
import { Button } from "./Button";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  title?: string;
  wide?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
};

const SIZE: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  title = "Modal",
  wide,
  size = "lg",
  children,
  footer,
  onClose,
}: ModalProps) {
  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // lock scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const maxW = wide ? "max-w-5xl" : SIZE[size];

  return (
    <div className="fixed inset-0 z-[999]">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* wrapper */}
      <div className="absolute inset-0 flex items-start justify-center p-3 sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          className={clsx(
            "w-full",
            maxW,
            "overflow-hidden rounded-3xl border border-white/10",
            "bg-zinc-950 text-white shadow-2xl"
          )}
        >
          {/* header */}
          <div className="flex items-start justify-between gap-3 border-b border-white/10 bg-white/5 px-4 py-3 sm:px-6 sm:py-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold sm:text-base">{title}</div>
              <div className="mt-0.5 text-[11px] text-white/50">
                Klik luar modal / tekan{" "}
                <span className="rounded-md border border-white/10 bg-black/30 px-1.5 py-0.5">
                  ESC
                </span>{" "}
                untuk menutup
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-2xl border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* body */}
          <div className="max-h-[75vh] overflow-auto px-4 py-4 sm:max-h-[80vh] sm:px-6 sm:py-5">
            {children}
          </div>

          {/* footer */}
          {footer ? (
            <div className="flex flex-col-reverse gap-2 border-t border-white/10 bg-white/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  desc?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({
  open,
  title = "Konfirmasi",
  desc = "Yakin?",
  confirmText = "Ya, lanjut",
  cancelText = "Batal",
  danger,
  loading,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      size="sm"
      onClose={loading ? () => {} : onClose}
      footer={
        <>
          <Button type="button" variant="ghost" className="h-11" onClick={onClose} disabled={!!loading}>
            {cancelText}
          </Button>

          <Button
            type="button"
            className={clsx(
              "h-11",
              danger ? "bg-rose-500 text-black hover:bg-rose-400" : ""
            )}
            onClick={onConfirm}
            disabled={!!loading}
          >
            {loading ? "Memproses..." : confirmText}
          </Button>
        </>
      }
    >
      <div className="text-sm text-white/75 leading-relaxed">{desc}</div>
      {danger ? (
        <div className="mt-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-100/80">
          Tindakan ini tidak bisa dibatalkan.
        </div>
      ) : null}
    </Modal>
  );
}

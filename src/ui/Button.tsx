import React from "react";
import { clsx } from "./format";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "ghost" | "danger";
};

export function Button({ className, variant = "solid", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";
  const v =
    variant === "ghost"
      ? "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
      : variant === "danger"
      ? "border border-red-500/20 bg-red-500/15 text-red-100 hover:bg-red-500/25"
      : "border border-white/10 bg-white/10 text-white hover:bg-white/15";

  return <button className={clsx(base, v, className)} {...props} />;
}

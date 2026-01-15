import React from "react";
import { clsx } from "./format";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        "h-10 w-full rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20",
        className
      )}
      {...props}
    />
  );
}

type TAProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export function Textarea({ className, ...props }: TAProps) {
  return (
    <textarea
      className={clsx(
        "min-h-[110px] w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/20",
        className
      )}
      {...props}
    />
  );
}

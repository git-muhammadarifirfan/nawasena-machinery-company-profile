import React from "react";
import { clsx } from "./format";

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("mx-auto w-full max-w-6xl px-4", className)} {...props} />;
}

import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-ink outline-none transition placeholder:text-copy-muted focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10",
        className
      )}
      {...props}
    />
  );
}

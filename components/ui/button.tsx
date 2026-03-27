import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "default" | "sm" | "lg";

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-ink text-white hover:bg-[#08172c] border border-transparent",
  secondary: "bg-white text-ink border border-line hover:bg-[#F9FAFB]",
  ghost: "bg-transparent text-ink border border-transparent hover:bg-[#F3F4F6]",
  danger: "bg-[#991B1B] text-white border border-transparent hover:bg-[#7F1D1D]"
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  default: "h-11 px-4 text-sm",
  sm: "h-9 px-3 text-sm",
  lg: "h-12 px-5 text-sm"
};

export function Button({
  className,
  variant = "primary",
  size = "default",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/30 disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

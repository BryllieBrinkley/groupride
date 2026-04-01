import React from "react";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  pending: "border-[#ecd9ad] bg-[#f7ecce] text-[#8b6b3f]",
  confirmed: "border-[#cfdcc8] bg-[#e4efe0] text-[#597358]",
  cancelled: "border-[#ead6d0] bg-[#f4e6e1] text-[#8c5d50]",
  completed: "border-[#d2dfeb] bg-[#e2ecf5] text-[#57728d]",
  active: "border-[#cfdcc8] bg-[#e4efe0] text-[#597358]",
  suspended: "border-[#ead6d0] bg-[#f4e6e1] text-[#8c5d50]",
  default: "border-border bg-background text-muted-foreground",
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const color = statusColors[normalized] || statusColors.default;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em]",
        color,
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

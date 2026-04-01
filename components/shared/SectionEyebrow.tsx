import React from "react";

import { cn } from "@/lib/utils";

interface SectionEyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionEyebrow({ children, className = "" }: SectionEyebrowProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

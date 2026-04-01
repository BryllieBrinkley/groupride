import React from "react";

import { cn } from "@/lib/utils";

interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterBar({ children, className = "" }: FilterBarProps) {
  return (
    <div className={cn("premium-panel flex flex-wrap items-center gap-3 px-5 py-5", className)}>
      {children}
    </div>
  );
}

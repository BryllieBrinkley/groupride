import React from "react";

import { cn } from "@/lib/utils";

export function LoadingSkeleton({
  className = "h-32 w-full rounded-3xl border border-border bg-card/80 animate-pulse",
}: {
  className?: string;
}) {
  return <div className={cn(className)} />;
}

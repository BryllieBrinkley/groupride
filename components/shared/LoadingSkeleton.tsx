import React from "react";

export function LoadingSkeleton({ className = "h-6 w-full rounded bg-muted animate-pulse" }: { className?: string }) {
  return <div className={className} />;
}

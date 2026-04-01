import React from "react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, icon, className = "" }: StatCardProps) {
  return (
    <div className={cn("premium-panel px-6 py-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="premium-eyebrow">{label}</p>
          <div className="mt-4 text-3xl font-medium tracking-[-0.04em] text-foreground">{value}</div>
        </div>
        {icon ? (
          <div className="flex size-11 items-center justify-center rounded-full border border-border bg-background text-primary">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}

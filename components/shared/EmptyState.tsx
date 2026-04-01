import React from "react";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, children, className }: EmptyStateProps) {
  return (
    <div className={cn("premium-panel flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
      {icon ? (
        <div className="mb-5 flex size-16 items-center justify-center rounded-full border border-border bg-background text-primary">
          {icon}
        </div>
      ) : null}
      <h3 className="text-2xl font-medium tracking-[-0.03em] text-foreground">{title}</h3>
      {description ? <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p> : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

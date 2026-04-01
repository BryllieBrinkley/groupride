import React from "react";

import { cn } from "@/lib/utils";

export type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("premium-panel px-7 py-8 md:px-10 md:py-10", className)}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="premium-eyebrow mb-3">{eyebrow}</p> : null}
          <h1 className="text-4xl font-medium tracking-[-0.05em] text-foreground sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              {description}
            </p>
          ) : null}
          {meta ? <div className="mt-5 flex flex-wrap gap-2.5">{meta}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
      </div>
      {children ? <div className="mt-8">{children}</div> : null}
    </header>
  );
}

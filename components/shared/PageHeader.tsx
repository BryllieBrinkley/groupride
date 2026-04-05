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
    <header className={cn("premium-panel px-7 py-9 md:px-11 md:py-11", className)}>
      <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl space-y-4">
          {eyebrow ? <p className="premium-eyebrow">{eyebrow}</p> : null}
          <h1 className="text-[clamp(2.25rem,4.2vw,3.7rem)] font-semibold tracking-[-0.045em] text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-[clamp(1rem,0.4vw+0.94rem,1.14rem)] leading-8 text-muted-foreground">
              {description}
            </p>
          ) : null}
          {meta ? <div className="flex flex-wrap gap-2.5 pt-1">{meta}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-3 pt-1">{actions}</div> : null}
      </div>
      {children ? <div className="mt-10">{children}</div> : null}
    </header>
  );
}

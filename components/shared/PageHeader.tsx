import React from "react";

import React from "react";

export type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <header className="mb-8 rounded-2xl border border-[#e5e0d8] bg-[#f7f4ef] shadow-[0_4px_24px_rgba(0,0,0,0.04)] px-6 py-8 md:px-10 md:py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          {eyebrow && (
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
              {eyebrow}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-2 lowercase">
            {title}
          </h1>
          {description && (
            <p className="text-lg text-muted-foreground mb-4 lowercase">{description}</p>
          )}
          {meta && <div className="mb-2">{meta}</div>}
        </div>
        {actions && (
          <div className="flex-shrink-0 flex flex-row md:flex-col gap-2 md:items-end">{actions}</div>
        )}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}

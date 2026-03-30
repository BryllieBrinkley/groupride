import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  meta,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow}
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            {title}
          </h1>

          {description ? (
            <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
              {description}
            </p>
          ) : null}
        </div>

        {children ? (
          <div className="flex w-full flex-col gap-3 lg:w-auto">
            {children}
          </div>
        ) : null}
      </div>

      {meta ? (
        <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-6">
          {meta}
        </div>
      ) : null}
    </div>
  );
}
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  meta
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <Card className="bg-[#F6F8FA]">
      <CardHeader className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <Badge variant="neutral">{eyebrow}</Badge>
          <CardTitle className="mt-5 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{title}</CardTitle>
          {description ? <p className="mt-4 text-base leading-7 text-copy">{description}</p> : null}
        </div>
        {children ? <div className="flex w-full flex-col gap-3 lg:w-auto">{children}</div> : null}
      </CardHeader>
      {meta ? <CardContent className="pt-0">{meta}</CardContent> : null}
    </Card>
  );
}

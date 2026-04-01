import React from "react";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeading({ children, className = "" }: SectionHeadingProps) {
  return (
    <h2 className={cn("text-3xl font-medium tracking-[-0.04em] text-foreground sm:text-4xl", className)}>
      {children}
    </h2>
  );
}

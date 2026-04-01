import React from "react";

interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeading({ children, className = "" }: SectionHeadingProps) {
  return (
    <h2 className={`text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-4 ${className}`}>
      {children}
    </h2>
  );
}

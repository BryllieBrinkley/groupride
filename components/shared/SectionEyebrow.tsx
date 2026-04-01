import React from "react";

interface SectionEyebrowProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionEyebrow({ children, className = "" }: SectionEyebrowProps) {
  return (
    <div className={`uppercase text-xs tracking-widest text-muted-foreground mb-2 ${className}`}>
      {children}
    </div>
  );
}

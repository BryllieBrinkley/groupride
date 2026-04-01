import React from "react";

interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterBar({ children, className = "" }: FilterBarProps) {
  return (
    <div className={`flex flex-wrap gap-2 items-center mb-6 ${className}`}>
      {children}
    </div>
  );
}

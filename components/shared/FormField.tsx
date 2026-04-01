import React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  className?: string;
}

export function FormField({ label, htmlFor, children, error, hint, className = "" }: FormFieldProps) {
  return (
    <div className={cn("space-y-2.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
      {error ? <div className="text-xs text-[#9c5e51]">{error}</div> : null}
    </div>
  );
}

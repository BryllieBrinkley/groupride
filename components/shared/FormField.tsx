import React from "react";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  error?: string;
  className?: string;
}

export function FormField({ label, htmlFor, children, error, className = "" }: FormFieldProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-muted-foreground mb-1">
        {label}
      </label>
      {children}
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </div>
  );
}

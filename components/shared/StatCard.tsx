import React from "react";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, icon, className = "" }: StatCardProps) {
  return (
    <div className={`rounded-xl bg-white shadow-md p-6 flex items-center gap-4 ${className}`}>
      {icon && <div className="text-3xl text-primary">{icon}</div>}
      <div>
        <div className="text-sm text-muted-foreground mb-1">{label}</div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </div>
    </div>
  );
}

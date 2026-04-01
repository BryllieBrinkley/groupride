import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
  default: "bg-gray-100 text-gray-800",
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const color = statusColors[status] || statusColors.default;
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${color} ${className}`}>
      {status}
    </span>
  );
}

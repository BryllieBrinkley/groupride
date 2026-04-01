import React from "react";

import { cn } from "@/lib/utils";

interface DataTableProps<T> {
  columns: Array<{ key: keyof T | string; label: string; render?: (value: any, row: T) => React.ReactNode }>;
  data: T[];
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends object>({
  columns,
  data,
  emptyMessage = "No data found.",
  className = "",
}: DataTableProps<T>) {
  return (
    <div className={cn("premium-panel overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-background/70">
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-6 py-4 text-left text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="border-b border-border/70 last:border-b-0 hover:bg-background/55">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-6 py-5 align-middle text-sm text-foreground">
                      {col.render
                        ? col.render(row[col.key as keyof T], row)
                        : (row[col.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

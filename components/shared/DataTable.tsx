import React from "react";

interface DataTableProps<T> {
  columns: Array<{ key: keyof T; label: string; render?: (value: any, row: T) => React.ReactNode }>;
  data: T[];
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends object>({ columns, data, emptyMessage = "No data found.", className = "" }: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto rounded-xl shadow-sm bg-white ${className}`}>
      <table className="min-w-full divide-y divide-border">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="even:bg-muted/50">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

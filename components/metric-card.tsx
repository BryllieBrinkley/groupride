import { SystemStatCard } from "@/components/system-stat-card";

export function MetricCard({
  label,
  value,
  supporting
}: {
  label: string;
  value: string;
  supporting?: string;
}) {
  return <SystemStatCard label={label} value={value} supporting={supporting} />;
}

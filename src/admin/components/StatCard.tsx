import { type LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "text-accent",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink/60">{label}</span>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-paper ${accent}`}>
          <Icon size={18} />
        </span>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{value}</div>
    </div>
  );
}

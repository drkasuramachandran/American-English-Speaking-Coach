interface ScoreCardProps {
  label: string;
  value: number; // 0–100
  compact?: boolean;
}

function toneFor(value: number): { bar: string; text: string } {
  if (value >= 85) return { bar: 'bg-emerald-500', text: 'text-emerald-600' };
  if (value >= 70) return { bar: 'bg-brand-600', text: 'text-brand-600' };
  return { bar: 'bg-amber-500', text: 'text-amber-600' };
}

export default function ScoreCard({ label, value, compact = false }: ScoreCardProps) {
  const tone = toneFor(value);

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white ${compact ? 'p-3.5' : 'p-4'}`}
      data-testid={`score-card-${label.toLowerCase()}`}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </span>
        <span className={`text-lg font-bold tabular-nums ${tone.text}`} data-testid={`score-value-${label.toLowerCase()}`}>
          {value}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${tone.bar} transition-[width] duration-700 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

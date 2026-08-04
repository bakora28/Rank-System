import { clsx } from 'clsx';
import type { Period } from '@/api/ranks';

const OPTIONS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Today' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

export function PeriodPillRow({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'rounded-full px-4 py-2 text-xs font-semibold transition-colors cursor-pointer',
            value === opt.value ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/30' : 'border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

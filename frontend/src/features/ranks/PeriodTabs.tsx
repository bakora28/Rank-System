import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { Period } from '@/api/ranks';

const OPTIONS: { value: Period; label: string; short: string }[] = [
  { value: 'day', label: 'Today', short: 'Day' },
  { value: 'month', label: 'This Month', short: 'Month' },
  { value: 'year', label: 'This Year', short: 'Year' },
  { value: 'all', label: 'All Time', short: 'All' },
];

export function PeriodTabs({ value, onChange, compact = false }: { value: Period; onChange: (p: Period) => void; compact?: boolean }) {
  return (
    <div className={clsx('inline-flex', compact ? 'gap-0.5' : 'rounded-lg bg-slate-100 p-1')}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'relative rounded-full font-medium transition-colors cursor-pointer',
            compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-1.5 text-xs',
            value === opt.value ? 'text-slate-800' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {value === opt.value && (
            <motion.div
              layoutId="period-pill"
              className={clsx('absolute inset-0 shadow-sm', compact ? 'rounded-full bg-brand-50' : 'rounded-md bg-white')}
              transition={{ duration: 0.2 }}
            />
          )}
          <span className="relative">{compact ? opt.short : opt.label}</span>
        </button>
      ))}
    </div>
  );
}

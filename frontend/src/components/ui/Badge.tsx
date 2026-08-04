import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

type Tone = 'default' | 'success' | 'danger' | 'warning' | 'brand';

const tones: Record<Tone, string> = {
  default: 'bg-slate-100 text-slate-600',
  success: 'bg-emerald-50 text-success',
  danger: 'bg-red-50 text-danger',
  warning: 'bg-amber-50 text-amber-600',
  brand: 'bg-brand-50 text-brand-600',
};

export function Badge({ tone = 'default', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className
      )}
      {...rest}
    />
  );
}

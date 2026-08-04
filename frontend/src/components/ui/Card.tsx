import type { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('bg-white rounded-3xl border border-slate-200/70 shadow-card', className)}
      {...rest}
    />
  );
}

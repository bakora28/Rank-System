import { type SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, Props>(({ label, className, children, ...rest }, ref) => (
  <label className="flex flex-col gap-1.5">
    {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
    <select
      ref={ref}
      className={clsx(
        'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors',
        'focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
        className
      )}
      {...rest}
    >
      {children}
    </select>
  </label>
));
Select.displayName = 'Select';

import { type InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, id, ...rest }, ref) => (
  <label className="flex flex-col gap-1.5">
    {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
    <input
      ref={ref}
      id={id}
      className={clsx(
        'rounded-lg border px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400',
        'focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
        error ? 'border-danger' : 'border-slate-200',
        className
      )}
      {...rest}
    />
    {error && <span className="text-xs text-danger">{error}</span>}
  </label>
));
Input.displayName = 'Input';

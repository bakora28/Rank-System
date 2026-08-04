import { type InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, Props>(({ label, error, className, id, ...rest }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          className={clsx(
            'w-full rounded-lg border px-3 py-2 pr-10 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400',
            'focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
            error ? 'border-danger' : 'border-slate-200',
            className
          )}
          {...rest}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
});
PasswordInput.displayName = 'PasswordInput';

import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={clsx('flex items-center justify-center py-10 text-slate-400', className)}>
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}

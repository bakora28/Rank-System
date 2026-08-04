import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const TONES = {
  brand: 'bg-brand-500',
  success: 'bg-success',
  sunset: 'bg-gradient-to-r from-orange-400 to-rose-500',
};

export function ProgressBar({ value, className, tone = 'brand' }: { value: number; className?: string; tone?: keyof typeof TONES }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={clsx('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className={clsx('h-full rounded-full', TONES[tone])}
      />
    </div>
  );
}

import { motion } from 'framer-motion';
import { clsx } from 'clsx';

function scorePassword(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const COLORS = ['bg-slate-200', 'bg-danger', 'bg-amber-400', 'bg-brand-500', 'bg-success'];

export function PasswordStrength({ password }: { password: string }) {
  const score = scorePassword(password);

  if (!password) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: i < score ? '100%' : '0%' }}
              transition={{ duration: 0.25 }}
              className={clsx('h-full rounded-full', COLORS[score])}
            />
          </div>
        ))}
      </div>
      <span className={clsx('text-xs', score <= 1 ? 'text-danger' : 'text-slate-400')}>{LABELS[score]}</span>
    </div>
  );
}

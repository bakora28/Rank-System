import { motion } from 'framer-motion';
import { Gift as GiftIcon } from 'lucide-react';
import { clsx } from 'clsx';
import type { Gift } from '@/types';

const PALETTES = [
  'from-indigo-400 via-violet-400 to-purple-500',
  'from-fuchsia-400 via-pink-400 to-rose-400',
  'from-sky-400 via-cyan-400 to-teal-400',
  'from-amber-300 via-orange-400 to-rose-400',
];

const PERIOD_LABEL: Record<string, string> = { none: 'Manual', '6_months': '6 Months', yearly: 'Yearly' };

export function GiftCardVisual({ gift, index = 0 }: { gift: Gift; index?: number }) {
  const isAuto = gift.criteria_type === 'period_top1';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', bounce: 0.3 }}
      whileHover={{ y: -6, rotate: 0.5 }}
      className={clsx(
        'relative flex h-36 w-full shrink-0 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-lg',
        PALETTES[index % PALETTES.length]
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
      <div className="pointer-events-none absolute -bottom-6 -right-6 size-24 rounded-full bg-white/10 blur-xl" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex size-8 items-center justify-center rounded-lg bg-white/25 backdrop-blur-sm">
          <GiftIcon className="size-4" />
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm">
          <span className={clsx('size-1.5 rounded-full', isAuto ? 'bg-emerald-300' : 'bg-amber-300')} />
          {isAuto ? 'Auto' : 'Manual'}
        </span>
      </div>

      <div className="relative z-10">
        <p className="text-lg font-bold leading-tight drop-shadow-sm">{gift.name}</p>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-white/80">
          <span>{PERIOD_LABEL[gift.period]}</span>
          <div className="flex -space-x-1.5">
            <span className="size-3.5 rounded-full bg-white/40" />
            <span className="size-3.5 rounded-full bg-white/70" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

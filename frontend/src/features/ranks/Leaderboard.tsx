import { motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { Avatar } from '@/components/ui/Avatar';
import type { RankRow } from '@/types';

const MEDAL: Record<number, string> = { 1: 'bg-gold', 2: 'bg-silver', 3: 'bg-bronze' };

function PositionBadge({ position }: { position: number }) {
  if (position <= 3) {
    return (
      <div className={clsx('flex size-7 items-center justify-center rounded-full text-xs font-bold text-white', MEDAL[position])}>
        {position}
      </div>
    );
  }
  return <div className="flex size-7 items-center justify-center text-sm font-semibold text-slate-400">{position}</div>;
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
        <Minus className="size-3" /> 0
      </span>
    );
  }
  const positive = delta > 0;
  return (
    <span className={clsx('flex items-center gap-1 text-xs font-semibold', positive ? 'text-success' : 'text-danger')}>
      {positive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
      {positive ? '+' : ''}
      {delta}
    </span>
  );
}

export function Leaderboard({ rows, highlightUserId }: { rows: RankRow[]; highlightUserId?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
            <th className="w-16 px-4 py-3">Position</th>
            <th className="px-4 py-3">Teacher</th>
            <th className="w-28 px-4 py-3">Change</th>
            <th className="w-24 px-4 py-3 text-right">Books</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <motion.tr
              layout
              key={row.teacher.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={clsx(
                'border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/70',
                highlightUserId === row.teacher.id && 'bg-brand-50/50'
              )}
            >
              <td className="px-4 py-3">
                <PositionBadge position={row.position} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={row.teacher.name} src={row.teacher.avatar} size={32} />
                  <span className="font-medium text-slate-700">{row.teacher.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <DeltaBadge delta={row.delta} />
              </td>
              <td className="px-4 py-3 text-right font-semibold text-slate-700">{row.points}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

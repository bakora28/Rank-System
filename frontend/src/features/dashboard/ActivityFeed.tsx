import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { timeAgo } from '@/lib/timeAgo';
import type { PurchaseRequestItem } from '@/types';

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-amber-400',
  approved: 'bg-emerald-500',
  rejected: 'bg-rose-500',
};

const STATUS_TEXT: Record<string, string> = {
  pending: 'Awaiting review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export function ActivityFeed({ items, showTeacher = true }: { items: PurchaseRequestItem[]; showTeacher?: boolean }) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No activity yet</p>;
  }

  return (
    <div className="flex flex-col">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 border-b border-slate-50 py-2.5 last:border-0"
        >
          <span className={clsx('size-2 shrink-0 rounded-full', STATUS_DOT[item.status])} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-slate-700">
              {showTeacher && <span className="font-medium">{item.teacher.name}</span>}
              {showTeacher && ' · '}
              {item.book.name}
            </p>
            <p className="text-xs text-slate-400">{STATUS_TEXT[item.status]}</p>
          </div>
          <span className="shrink-0 text-xs text-slate-400">{timeAgo(item.reviewed_at ?? item.created_at)}</span>
        </motion.div>
      ))}
    </div>
  );
}

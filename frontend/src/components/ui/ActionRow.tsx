import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export function ActionRow({
  to,
  icon,
  iconClass,
  label,
  index = 0,
}: {
  to: string;
  icon: ReactNode;
  iconClass: string;
  label: string;
  index?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
      <Link to={to} className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-slate-50">
        <span className={clsx('flex size-8 shrink-0 items-center justify-center rounded-full text-white', iconClass)}>{icon}</span>
        <span className="flex-1 text-sm font-medium text-slate-700">{label}</span>
        <ChevronRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
      </Link>
    </motion.div>
  );
}

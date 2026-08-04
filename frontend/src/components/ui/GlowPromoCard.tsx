import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function GlowPromoCard({
  eyebrow,
  title,
  subtitle,
  icon,
  ctaHref,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  ctaHref: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 p-[1.5px] shadow-[0_0_40px_-8px_rgba(168,85,247,0.45)]"
    >
      <div className="relative overflow-hidden rounded-2xl bg-ink-950 p-5">
        <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-fuchsia-500/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-6 size-28 rounded-full bg-cyan-400/20 blur-2xl" />

        <div className="relative z-10 flex items-start justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-300">{eyebrow}</span>
          <div className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm">{icon}</div>
        </div>

        <p className="relative z-10 mt-2 text-lg font-bold leading-tight text-white">{title}</p>
        <p className="relative z-10 mt-1 text-xs text-white/60">{subtitle}</p>

        <Link
          to={ctaHref}
          className="relative z-10 mt-4 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
        >
          Explore <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Award, Gift as GiftIcon, Repeat, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Gift } from '@/types';

const PERIOD_LABEL: Record<string, string> = {
  none: 'Special award',
  '6_months': 'Every 6 months',
  yearly: 'Once a year',
};

export function GiftCard({ gift, index = 0, actions }: { gift: Gift; index?: number; actions?: ReactNode }) {
  const progress = gift.progress;
  const progressPct = progress?.leader && progress.my_points != null && progress.leader.points > 0
    ? Math.min(100, (progress.my_points / progress.leader.points) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', bounce: 0.25 }}
      whileHover={{ y: -4 }}
    >
      <Card className="relative overflow-hidden p-0 transition-shadow hover:shadow-card-hover">
        <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700">
          {gift.image_url ? (
            <>
              <img src={gift.image_url} alt={gift.name} className="absolute inset-0 h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/10" />
            </>
          ) : (
            <>
              <motion.div
                className="absolute inset-0 opacity-30"
                animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror' }}
                style={{
                  backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), transparent 40%)',
                  backgroundSize: '200% 200%',
                }}
              />
              <div className="flex size-20 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
                <GiftIcon className="size-10" />
              </div>
            </>
          )}
          <Badge className="absolute left-3 top-3 bg-white/90 text-slate-700">
            {gift.criteria_type === 'period_top1' ? <Repeat className="size-3" /> : <Sparkles className="size-3" />}
            {PERIOD_LABEL[gift.period]}
          </Badge>
          {!gift.is_active && (
            <Badge tone="danger" className="absolute right-3 top-3 bg-white/90">
              Inactive
            </Badge>
          )}
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-slate-800">{gift.name}</h3>
          {gift.description && <p className="mt-1 text-sm text-slate-500 line-clamp-2">{gift.description}</p>}

          {gift.criteria_type === 'period_top1' && progress && (
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Current leader</span>
                {progress.leader ? (
                  <span className="font-semibold text-slate-700">
                    {progress.leader.name} · {progress.leader.points} books
                  </span>
                ) : (
                  <span className="text-slate-400">No entries yet</span>
                )}
              </div>
              {progress.my_points != null && (
                <>
                  <ProgressBar value={progressPct} />
                  <p className="mt-1.5 text-xs text-slate-400">
                    You: {progress.my_points} book{progress.my_points === 1 ? '' : 's'}
                  </p>
                </>
              )}
            </div>
          )}

          {gift.latest_award && (
            <div className="mt-4 flex items-center gap-2.5 rounded-lg bg-amber-50/70 px-3 py-2.5">
              <Award className="size-4 shrink-0 text-gold" />
              <Avatar name={gift.latest_award.user.name} src={gift.latest_award.user.avatar} size={24} />
              <p className="text-xs text-slate-600">
                <span className="font-semibold">{gift.latest_award.user.name}</span> won this gift
              </p>
            </div>
          )}

          {actions && <div className="mt-4 flex gap-2">{actions}</div>}
        </div>
      </Card>
    </motion.div>
  );
}

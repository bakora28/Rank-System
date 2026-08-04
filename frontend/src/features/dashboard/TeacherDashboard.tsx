import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Gift as GiftIcon, Trophy } from 'lucide-react';
import { fetchActivity, fetchTop10, type Period } from '@/api/ranks';
import { listGifts } from '@/api/gifts';
import { listPurchaseRequests } from '@/api/purchaseRequests';
import { useAuthStore } from '@/store/auth';
import { Card } from '@/components/ui/Card';
import { StatStrip } from '@/components/ui/StatStrip';
import { ActivityChart } from '@/components/ui/ActivityChart';
import { ActionRow } from '@/components/ui/ActionRow';
import { GlowPromoCard } from '@/components/ui/GlowPromoCard';
import { GiftCardVisual } from '@/features/gifts/GiftCardVisual';
import { PeriodPillRow } from '@/features/ranks/PeriodPillRow';
import { ActivityFeed } from './ActivityFeed';

export default function TeacherDashboard() {
  const [period, setPeriod] = useState<Period>('month');
  const user = useAuthStore((s) => s.user);

  const { data } = useQuery({ queryKey: ['ranks', 'top10', period], queryFn: () => fetchTop10(period) });
  const { data: gifts } = useQuery({ queryKey: ['gifts'], queryFn: listGifts });
  const { data: activity } = useQuery({ queryKey: ['activity', 7], queryFn: () => fetchActivity(7) });
  const { data: recent } = useQuery({
    queryKey: ['purchase-requests', 'mine-recent'],
    queryFn: () => listPurchaseRequests({ page: 1, per_page: 6 }),
  });

  const myRow = data?.data.find((r) => r.teacher.id === user?.id) ?? data?.me ?? null;
  const leader = data?.data[0];
  const wonGifts = gifts?.filter((g) => g.latest_award?.user.id === user?.id).length ?? 0;
  const nextGift = gifts?.find((g) => g.criteria_type === 'period_top1' && g.latest_award?.user.id !== user?.id);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="text-sm text-slate-400">See how you stack up against the rest of the school.</p>
        </div>
        <PeriodPillRow value={period} onChange={setPeriod} />
      </div>

      <StatStrip
        items={[
          { label: 'Current Rank', value: myRow?.position ?? 0 },
          { label: 'Books Approved', value: myRow?.points ?? 0 },
          { label: 'Gifts Won', value: wonGifts },
        ]}
      />

      {gifts && gifts.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {gifts.map((gift, i) => (
            <GiftCardVisual key={gift.id} gift={gift} index={i} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-800">Your activity — last 7 days</h2>
            {activity ? <ActivityChart data={activity} /> : <div className="h-40" />}
          </Card>

          <Card className="p-5">
            <h2 className="mb-1 text-sm font-semibold text-slate-800">Recent Activity</h2>
            {recent ? <ActivityFeed items={recent.data} showTeacher={false} /> : <div className="h-20" />}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-3">
            <h2 className="px-2 pt-2 text-sm font-semibold text-slate-800">Quick Actions</h2>
            <div className="mt-1">
              <ActionRow to="/teacher/categories" icon={<BookOpen className="size-4" />} iconClass="bg-gradient-to-br from-brand-500 to-brand-600" label="Browse categories" index={0} />
              <ActionRow to="/teacher/gifts" icon={<GiftIcon className="size-4" />} iconClass="bg-gradient-to-br from-emerald-400 to-teal-600" label="View gifts" index={1} />
            </div>
          </Card>

          {nextGift ? (
            <GlowPromoCard
              eyebrow="Up For Grabs"
              title={`Win the ${nextGift.name}`}
              subtitle={leader ? `${leader.teacher.name} leads with ${leader.points} books.` : 'Be the first to buy a book!'}
              icon={<GiftIcon className="size-4" />}
              ctaHref="/teacher/gifts"
            />
          ) : (
            <GlowPromoCard
              eyebrow="Your Standing"
              title={myRow ? `You're #${myRow.position}` : 'Get started'}
              subtitle="Buy more books to climb the leaderboard."
              icon={<Trophy className="size-4" />}
              ctaHref="/teacher/categories"
            />
          )}
        </div>
      </div>
    </div>
  );
}

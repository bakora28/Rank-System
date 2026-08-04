import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Award, ClipboardList, Gift as GiftIcon, Trophy, Users } from 'lucide-react';
import { fetchActivity, fetchTop10, type Period } from '@/api/ranks';
import { listPurchaseRequests } from '@/api/purchaseRequests';
import { listTeachers } from '@/api/teachers';
import { listGifts } from '@/api/gifts';
import { useAuthStore } from '@/store/auth';
import { Card } from '@/components/ui/Card';
import { StatStrip } from '@/components/ui/StatStrip';
import { ActivityChart } from '@/components/ui/ActivityChart';
import { ActionRow } from '@/components/ui/ActionRow';
import { GlowPromoCard } from '@/components/ui/GlowPromoCard';
import { GiftCardVisual } from '@/features/gifts/GiftCardVisual';
import { PeriodPillRow } from '@/features/ranks/PeriodPillRow';
import { ActivityFeed } from './ActivityFeed';

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>('month');
  const { user, can } = useAuthStore();

  const { data: ranks } = useQuery({ queryKey: ['ranks', 'top10', period], queryFn: () => fetchTop10(period) });
  const { data: pending } = useQuery({
    queryKey: ['purchase-requests', 'pending-count'],
    queryFn: () => listPurchaseRequests({ status: 'pending', page: 1 }),
    enabled: can('requests.view'),
  });
  const { data: recent } = useQuery({
    queryKey: ['purchase-requests', 'recent'],
    queryFn: () => listPurchaseRequests({ page: 1, per_page: 6 }),
    enabled: can('requests.view'),
  });
  const { data: teachers } = useQuery({
    queryKey: ['teachers', 'count'],
    queryFn: () => listTeachers({ page: 1 }),
    enabled: can('teachers.view'),
  });
  const { data: gifts } = useQuery({ queryKey: ['gifts'], queryFn: listGifts, enabled: can('gifts.view') });
  const { data: activity } = useQuery({ queryKey: ['activity', 7], queryFn: () => fetchActivity(7) });

  const leader = ranks?.data[0];
  const nextGift = gifts?.find((g) => g.criteria_type === 'period_top1');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="text-sm text-slate-400">Here's how the competition is shaping up.</p>
        </div>
        <PeriodPillRow value={period} onChange={setPeriod} />
      </div>

      <StatStrip
        items={[
          ...(teachers ? [{ label: 'Total Teachers', value: teachers.meta.total }] : []),
          ...(pending ? [{ label: 'Pending Requests', value: pending.meta.total }] : []),
          { label: 'Books This Period', value: leader?.points ?? 0 },
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
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800">Approvals — last 7 days</h2>
              <Link to="/admin/ranks" className="text-xs font-medium text-brand-600 hover:underline">
                Full ranking →
              </Link>
            </div>
            {activity ? <ActivityChart data={activity} /> : <div className="h-40" />}
          </Card>

          <Card className="p-5">
            <h2 className="mb-1 text-sm font-semibold text-slate-800">Recent Activity</h2>
            {recent ? <ActivityFeed items={recent.data} /> : <div className="h-20" />}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-3">
            <h2 className="px-2 pt-2 text-sm font-semibold text-slate-800">Quick Actions</h2>
            <div className="mt-1">
              <ActionRow to="/admin/requests" icon={<ClipboardList className="size-4" />} iconClass="bg-gradient-to-br from-orange-400 to-rose-500" label="Review requests" index={0} />
              <ActionRow to="/admin/teachers" icon={<Users className="size-4" />} iconClass="bg-gradient-to-br from-brand-500 to-brand-600" label="Manage teachers" index={1} />
              <ActionRow to="/admin/gifts" icon={<GiftIcon className="size-4" />} iconClass="bg-gradient-to-br from-emerald-400 to-teal-600" label="Manage gifts" index={2} />
            </div>
          </Card>

          {nextGift && (
            <GlowPromoCard
              eyebrow="Next Automatic Gift"
              title={`${nextGift.name} — top teacher wins`}
              subtitle={leader ? `${leader.teacher.name} is currently leading.` : 'No entries yet this period.'}
              icon={<Award className="size-4" />}
              ctaHref="/admin/gifts"
            />
          )}

          {!nextGift && leader && (
            <GlowPromoCard
              eyebrow="This Month's Leader"
              title={leader.teacher.name}
              subtitle={`${leader.points} books approved so far.`}
              icon={<Trophy className="size-4" />}
              ctaHref="/admin/ranks"
            />
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { fetchFullRanks, type Period } from '@/api/ranks';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Leaderboard } from './Leaderboard';
import { PeriodTabs } from './PeriodTabs';
import type { Subject } from '@/types';

const SUBJECT_LABEL: Record<Subject, string> = { maths: 'Maths', science: 'Science' };
const SUBJECT_TONE: Record<Subject, 'brand' | 'success'> = { maths: 'brand', science: 'success' };

function SubjectRankPanel({ subject, period, q }: { subject: Subject; period: Period; q: string }) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['ranks', 'full', subject, period, q, page],
    queryFn: () => fetchFullRanks(period, q, page, subject),
  });

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-700">{SUBJECT_LABEL[subject]}</h2>
        {data && <Badge tone={SUBJECT_TONE[subject]}>{data.meta.total} teachers</Badge>}
      </div>

      {isLoading && <Spinner />}
      {!isLoading && data && data.data.length === 0 && <EmptyState title="No teachers in this subject yet" />}
      {!isLoading && data && data.data.length > 0 && (
        <>
          <Leaderboard rows={data.data} />
          <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} onChange={setPage} />
        </>
      )}
    </Card>
  );
}

export default function AdminRanks() {
  const [period, setPeriod] = useState<Period>('month');
  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q, 300);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Full Ranking</h1>
      <p className="mt-1 text-sm text-slate-500">Every teacher, ordered by approved book purchases — Maths and Science side by side.</p>

      <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Search className="size-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search teacher..."
            className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SubjectRankPanel subject="maths" period={period} q={debouncedQ} />
        <SubjectRankPanel subject="science" period={period} q={debouncedQ} />
      </div>
    </div>
  );
}

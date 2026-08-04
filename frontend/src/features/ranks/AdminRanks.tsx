import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { fetchFullRanks, type Period } from '@/api/ranks';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Leaderboard } from './Leaderboard';
import { PeriodTabs } from './PeriodTabs';

export default function AdminRanks() {
  const [period, setPeriod] = useState<Period>('month');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebouncedValue(q, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['ranks', 'full', period, debouncedQ, page],
    queryFn: () => fetchFullRanks(period, debouncedQ, page),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Full Ranking</h1>
      <p className="mt-1 text-sm text-slate-500">Every teacher, ordered by approved book purchases.</p>

      <Card className="mt-6 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="size-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search teacher..."
              className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <PeriodTabs
            value={period}
            onChange={(p) => {
              setPeriod(p);
              setPage(1);
            }}
          />
        </div>

        {isLoading && <Spinner />}
        {!isLoading && data && data.data.length === 0 && <EmptyState title="No teachers found" />}
        {!isLoading && data && data.data.length > 0 && (
          <>
            <Leaderboard rows={data.data} />
            <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}

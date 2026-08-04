import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { listWinners } from '@/api/gifts';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';

export function WinnersHistory() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({ queryKey: ['gift-winners', page], queryFn: () => listWinners(page) });

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-slate-800">Winners</h2>

      {isLoading && <Spinner />}

      {!isLoading && data && data.data.length === 0 && (
        <EmptyState icon={<Trophy className="size-8" />} title="No gifts awarded yet" description="Winners will show up here once awarded." />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data?.data.map((award, i) => (
          <motion.div key={award.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
            <Card className="flex items-center gap-3 p-4">
              <div className="relative">
                <Avatar name={award.user.name} src={award.user.avatar} size={44} />
                <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gold text-white ring-2 ring-white">
                  <Trophy className="size-3" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-800">{award.user.name}</p>
                <p className="truncate text-xs text-slate-500">Won {award.gift?.name}</p>
                <p className="text-[11px] text-slate-400">{new Date(award.awarded_at).toLocaleDateString()}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {data && <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} onChange={setPage} />}
    </div>
  );
}

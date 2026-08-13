import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Check, ClipboardList, Clock, Receipt, X } from 'lucide-react';
import { listPurchaseRequests } from '@/api/purchaseRequests';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ReceiptModal } from './ReceiptModal';
import type { PurchaseRequestItem, PurchaseStatus } from '@/types';

const STATUS_META = {
  pending: { label: 'Pending review', tone: 'warning' as const, icon: Clock },
  approved: { label: 'Approved', tone: 'success' as const, icon: Check },
  rejected: { label: 'Rejected', tone: 'danger' as const, icon: X },
};

const STATUS_TABS: { value: PurchaseStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function TeacherRequests() {
  const [status, setStatus] = useState<PurchaseStatus | ''>('');
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<PurchaseRequestItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-requests', 'mine', status, page],
    queryFn: () => listPurchaseRequests({ status: status || undefined, page }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">My Requests</h1>
      <p className="mt-1 text-sm text-slate-500">Every book you've marked as bought, and whether admin approved or rejected it.</p>

      <Card className="mt-6 p-5">
        <div className="mb-4 inline-flex rounded-lg bg-slate-100 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={clsx(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                status === tab.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading && <Spinner />}
        {!isLoading && data && data.data.length === 0 && (
          <EmptyState icon={<ClipboardList className="size-8" />} title="No requests yet" description="Mark a book as bought from Categories to see it here." />
        )}

        {!isLoading && data && data.data.length > 0 && (
          <div className="flex flex-col gap-2">
            {data.data.map((req, i) => {
              const meta = STATUS_META[req.status];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">{req.book.name}</p>
                    <p className="text-xs text-slate-400">{req.book.category}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge tone={meta.tone}>
                      <Icon className="size-3" /> {meta.label}
                    </Badge>
                    <Button size="sm" variant="secondary" onClick={() => setViewing(req)}>
                      <Receipt className="size-3.5" /> Receipt
                    </Button>
                  </div>
                </motion.div>
              );
            })}
            <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} onChange={setPage} />
          </div>
        )}
      </Card>

      <ReceiptModal request={viewing} onClose={() => setViewing(null)} title={(r) => r.book.name} />
    </div>
  );
}

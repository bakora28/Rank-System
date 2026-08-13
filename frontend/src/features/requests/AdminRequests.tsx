import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, ClipboardList, Receipt, Search, StickyNote, X } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { listPurchaseRequests, reviewPurchaseRequest } from '@/api/purchaseRequests';
import { listCategories } from '@/api/categories';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAuthStore } from '@/store/auth';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { ReceiptModal } from './ReceiptModal';
import type { PurchaseRequestItem, PurchaseStatus } from '@/types';

const STATUS_TONE: Record<PurchaseStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

const STATUS_TABS: { value: PurchaseStatus | ''; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: '', label: 'All history' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminRequests() {
  const [status, setStatus] = useState<PurchaseStatus | ''>('pending');
  const [categoryId, setCategoryId] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebouncedValue(q, 300);
  const queryClient = useQueryClient();
  const canEdit = useAuthStore((s) => s.can('requests.edit'));
  const [viewingReceipt, setViewingReceipt] = useState<PurchaseRequestItem | null>(null);

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => listCategories() });

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-requests', status, categoryId, debouncedQ, page],
    queryFn: () =>
      listPurchaseRequests({
        status: status || undefined,
        category_id: categoryId ? Number(categoryId) : undefined,
        q: debouncedQ || undefined,
        page,
      }),
  });

  const mutation = useMutation({
    mutationFn: ({ id, decision }: { id: number; decision: 'approved' | 'rejected' }) => reviewPurchaseRequest(id, decision),
    onSuccess: (_data, vars) => {
      toast.success(vars.decision === 'approved' ? 'Request approved' : 'Request rejected');
      queryClient.invalidateQueries({ queryKey: ['purchase-requests'] });
      queryClient.invalidateQueries({ queryKey: ['ranks'] });
    },
    onError: () => toast.error('Something went wrong.'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Purchase Requests</h1>
      <p className="mt-1 text-sm text-slate-500">Review and approve books teachers mark as bought.</p>

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

        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="size-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search teacher or book..."
              className="w-52 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
          <Select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        {isLoading && <Spinner />}
        {!isLoading && data && data.data.length === 0 && (
          <EmptyState icon={<ClipboardList className="size-8" />} title="No requests match these filters" />
        )}

        {!isLoading && data && data.data.length > 0 && (
          <div className="flex flex-col gap-2">
            {data.data.map((req, i) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={req.teacher.name} size={36} />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{req.teacher.name}</p>
                    <p className="text-xs text-slate-400">
                      {req.book.name} · {req.book.category}
                      {req.teacher_note && <StickyNote className="ml-1.5 inline size-3 text-slate-300 align-text-top" />}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge tone={STATUS_TONE[req.status]}>{req.status}</Badge>
                  <Button size="sm" variant="secondary" onClick={() => setViewingReceipt(req)}>
                    <Receipt className="size-3.5" /> Receipt
                  </Button>
                  {req.status === 'pending' && canEdit && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        loading={mutation.isPending && mutation.variables?.id === req.id && mutation.variables.decision === 'approved'}
                        onClick={() => mutation.mutate({ id: req.id, decision: 'approved' })}
                      >
                        <Check className="size-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={mutation.isPending && mutation.variables?.id === req.id && mutation.variables.decision === 'rejected'}
                        onClick={() => mutation.mutate({ id: req.id, decision: 'rejected' })}
                      >
                        <X className="size-3.5" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
            <Pagination page={data.meta.current_page} lastPage={data.meta.last_page} onChange={setPage} />
          </div>
        )}
      </Card>

      <ReceiptModal request={viewingReceipt} onClose={() => setViewingReceipt(null)} title={(r) => `Receipt — ${r.teacher.name}`} />
    </div>
  );
}

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, ClipboardList, Search, X } from 'lucide-react';
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
import type { PurchaseStatus } from '@/types';

const STATUS_TONE: Record<PurchaseStatus, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

export default function AdminRequests() {
  const [status, setStatus] = useState<PurchaseStatus | ''>('pending');
  const [categoryId, setCategoryId] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const debouncedQ = useDebouncedValue(q, 300);
  const queryClient = useQueryClient();
  const canEdit = useAuthStore((s) => s.can('requests.edit'));

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: listCategories });

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
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as PurchaseStatus | '');
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
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
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge tone={STATUS_TONE[req.status]}>{req.status}</Badge>
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
    </div>
  );
}

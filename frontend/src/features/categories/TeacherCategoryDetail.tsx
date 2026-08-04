import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Check, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { listBooks } from '@/api/categories';
import { markBookBought } from '@/api/purchaseRequests';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

const STATUS_META = {
  pending: { label: 'Pending review', tone: 'warning' as const, icon: Clock },
  approved: { label: 'Approved', tone: 'success' as const, icon: Check },
  rejected: { label: 'Rejected', tone: 'danger' as const, icon: X },
};

export default function TeacherCategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['books', categoryId],
    queryFn: () => listBooks(categoryId),
  });

  const mutation = useMutation({
    mutationFn: markBookBought,
    onSuccess: () => {
      toast.success('Marked as bought — waiting for admin approval.');
      queryClient.invalidateQueries({ queryKey: ['books', categoryId] });
    },
    onError: () => toast.error('Could not mark this book as bought.'),
  });

  return (
    <div>
      <Link to="/teacher/categories" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft className="size-4" /> Back to categories
      </Link>

      <h1 className="text-2xl font-bold text-slate-800">{data?.[0]?.category?.name ?? 'Books'}</h1>

      {isLoading && <Spinner />}

      {!isLoading && data && data.length === 0 && <EmptyState icon={<BookOpen className="size-8" />} title="No books yet in this category" />}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data?.map((book, i) => {
          const meta = book.my_status ? STATUS_META[book.my_status] : null;
          const Icon = meta?.icon;
          return (
            <motion.div key={book.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-700">{book.name}</p>
                  {meta && (
                    <Badge tone={meta.tone} className="mt-1.5">
                      {Icon && <Icon className="size-3" />} {meta.label}
                    </Badge>
                  )}
                </div>
                {!book.my_status && (
                  <Button size="sm" loading={mutation.isPending && mutation.variables === book.id} onClick={() => mutation.mutate(book.id)}>
                    Mark bought
                  </Button>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

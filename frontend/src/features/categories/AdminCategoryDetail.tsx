import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { createBook, deleteBook, listBooks, updateBook } from '@/api/categories';
import { useAuthStore } from '@/store/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Book } from '@/types';

export default function AdminCategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);
  const { can } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['books', categoryId], queryFn: () => listBooks(categoryId) });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [name, setName] = useState('');
  const [deleting, setDeleting] = useState<Book | null>(null);

  function openCreate() {
    setEditing(null);
    setName('');
    setModalOpen(true);
  }

  function openEdit(book: Book) {
    setEditing(book);
    setName(book.name);
    setModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: () => (editing ? updateBook(editing.id, { name }) : createBook(categoryId, name)),
    onSuccess: () => {
      toast.success(editing ? 'Book updated' : 'Book added');
      queryClient.invalidateQueries({ queryKey: ['books', categoryId] });
      setModalOpen(false);
    },
    onError: () => toast.error('Could not save book.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (bookId: number) => deleteBook(bookId),
    onSuccess: () => {
      toast.success('Book deleted');
      queryClient.invalidateQueries({ queryKey: ['books', categoryId] });
      setDeleting(null);
    },
    onError: () => toast.error('Could not delete book.'),
  });

  return (
    <div>
      <Link to="/admin/categories" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft className="size-4" /> Back to categories
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">{data?.[0]?.category?.name ?? 'Books'}</h1>
        {can('books.add') && (
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Add Book
          </Button>
        )}
      </div>

      {isLoading && <Spinner />}
      {!isLoading && data && data.length === 0 && <EmptyState icon={<BookOpen className="size-8" />} title="No books yet" />}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data?.map((book, i) => (
          <motion.div key={book.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="flex items-center justify-between gap-3 p-4">
              <p className="truncate font-medium text-slate-700">{book.name}</p>
              {(can('books.edit') || can('books.delete')) && (
                <div className="flex gap-1">
                  {can('books.edit') && (
                    <button onClick={() => openEdit(book)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer">
                      <Pencil className="size-3.5" />
                    </button>
                  )}
                  {can('books.delete') && (
                    <button onClick={() => setDeleting(book)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-danger cursor-pointer">
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Book' : 'Add Book'}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()} disabled={!name.trim()}>
              Save
            </Button>
          </>
        }
      >
        <Input label="Book name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. A Short History of Nearly Everything" />
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete book"
        message={`Delete "${deleting?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}

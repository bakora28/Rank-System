import { useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, FileText, Image, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { createBook, deleteBook, deleteBookFile, listBooks, updateBook, uploadBookFiles } from '@/api/categories';
import { useAuthStore } from '@/store/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Book } from '@/types';

const ACCEPTED_FILE_TYPES = '.png,.jpg,.jpeg,.pdf';

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminCategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);
  const { can } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['books', categoryId], queryFn: () => listBooks(categoryId) });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [name, setName] = useState('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deleting, setDeleting] = useState<Book | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const liveEditingBook = editing ? data?.find((b) => b.id === editing.id) : null;

  function openCreate() {
    setEditing(null);
    setName('');
    setNewFiles([]);
    setModalOpen(true);
  }

  function openEdit(book: Book) {
    setEditing(book);
    setName(book.name);
    setNewFiles([]);
    setModalOpen(true);
  }

  function handleFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length) setNewFiles((prev) => [...prev, ...picked]);
    e.target.value = '';
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        await updateBook(editing.id, { name });
        if (newFiles.length) await uploadBookFiles(editing.id, newFiles);
      } else {
        await createBook(categoryId, name, newFiles);
      }
    },
    onSuccess: () => {
      toast.success(editing ? 'Book updated' : 'Book added');
      queryClient.invalidateQueries({ queryKey: ['books', categoryId] });
      setModalOpen(false);
      setNewFiles([]);
    },
    onError: () => toast.error('Could not save book.'),
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: number) => deleteBookFile(editing!.id, fileId),
    onSuccess: () => {
      toast.success('Image removed');
      queryClient.invalidateQueries({ queryKey: ['books', categoryId] });
    },
    onError: () => toast.error('Could not remove image.'),
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
        width={560}
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
        <div className="flex flex-col gap-4">
          <Input label="Book name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. A Short History of Nearly Everything" />

          <div>
            <p className="mb-2 text-xs font-medium text-slate-600">Images / files (PNG, JPG, PDF)</p>

            {editing && liveEditingBook && liveEditingBook.files && liveEditingBook.files.length > 0 && (
              <div className="mb-2 flex flex-col gap-1.5">
                {liveEditingBook.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-w-0 items-center gap-2 text-sm text-slate-600 hover:text-brand-600"
                    >
                      {file.mime_type === 'application/pdf' ? (
                        <FileText className="size-4 shrink-0 text-slate-400" />
                      ) : (
                        <Image className="size-4 shrink-0 text-slate-400" />
                      )}
                      <span className="truncate">{file.name}</span>
                      <span className="shrink-0 text-xs text-slate-400">{formatSize(file.size)}</span>
                    </a>
                    <button
                      onClick={() => deleteFileMutation.mutate(file.id)}
                      disabled={deleteFileMutation.isPending}
                      className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-danger cursor-pointer disabled:opacity-50"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {newFiles.length > 0 && (
              <div className="mb-2 flex flex-col gap-1.5">
                {newFiles.map((file, i) => (
                  <div key={`${file.name}-${i}`} className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-brand-200 bg-brand-50/40 px-3 py-2">
                    <span className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                      {file.type === 'application/pdf' ? (
                        <FileText className="size-4 shrink-0 text-slate-400" />
                      ) : (
                        <Image className="size-4 shrink-0 text-slate-400" />
                      )}
                      <span className="truncate">{file.name}</span>
                      <span className="shrink-0 text-xs text-slate-400">{formatSize(file.size)}</span>
                    </span>
                    <button
                      onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-danger cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} multiple className="hidden" onChange={handleFilesPicked} />
            <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Plus className="size-3.5" /> Add files
            </Button>
          </div>
        </div>
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

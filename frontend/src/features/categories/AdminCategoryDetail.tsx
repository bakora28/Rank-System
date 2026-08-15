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

/** A4 page proportions (210×297mm) — matches how a real book/document page reads. */
const A4_ASPECT = 'aspect-[210/297]';

function isPdfType(mimeType: string) {
  return mimeType === 'application/pdf';
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface PendingFile {
  file: File;
  previewUrl: string | null;
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
  const [newFiles, setNewFiles] = useState<PendingFile[]>([]);
  const [deleting, setDeleting] = useState<Book | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const liveEditingBook = editing ? data?.find((b) => b.id === editing.id) : null;

  function revokePending(files: PendingFile[]) {
    files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
  }

  function openCreate() {
    revokePending(newFiles);
    setEditing(null);
    setName('');
    setNewFiles([]);
    setModalOpen(true);
  }

  function openEdit(book: Book) {
    revokePending(newFiles);
    setEditing(book);
    setName(book.name);
    setNewFiles([]);
    setModalOpen(true);
  }

  function closeModal() {
    revokePending(newFiles);
    setNewFiles([]);
    setModalOpen(false);
  }

  function handleFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).map((file) => ({
      file,
      previewUrl: file.type === 'application/pdf' ? null : URL.createObjectURL(file),
    }));
    if (picked.length) setNewFiles((prev) => [...prev, ...picked]);
    e.target.value = '';
  }

  function removePendingFile(index: number) {
    setNewFiles((prev) => {
      const target = prev[index];
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const files = newFiles.map((f) => f.file);
      if (editing) {
        await updateBook(editing.id, { name });
        if (files.length) await uploadBookFiles(editing.id, files);
      } else {
        await createBook(categoryId, name, files);
      }
    },
    onSuccess: () => {
      toast.success(editing ? 'Book updated' : 'Book added');
      queryClient.invalidateQueries({ queryKey: ['books', categoryId] });
      revokePending(newFiles);
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
        onClose={closeModal}
        title={editing ? 'Edit Book' : 'Add Book'}
        width={640}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeModal}>
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
            <p className="mb-2 text-xs font-medium text-slate-600">Cover images / files (PNG, JPG, PDF) — shown at page proportions (A4)</p>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {editing &&
                liveEditingBook?.files?.map((file) => (
                  <div key={file.id} className={`group relative ${A4_ASPECT} overflow-hidden rounded-lg border border-slate-200 bg-slate-50`}>
                    <a href={file.url} target="_blank" rel="noreferrer" className="block h-full w-full" title={`${file.name} · ${formatSize(file.size)}`}>
                      {isPdfType(file.mime_type) ? (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-2 text-center">
                          <FileText className="size-6 shrink-0 text-danger" />
                          <span className="line-clamp-3 text-[10px] leading-tight text-slate-500">{file.name}</span>
                        </div>
                      ) : (
                        <img src={file.url} alt={file.name} className="h-full w-full object-contain" />
                      )}
                    </a>
                    <button
                      onClick={() => deleteFileMutation.mutate(file.id)}
                      disabled={deleteFileMutation.isPending}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 cursor-pointer disabled:opacity-50 group-hover:opacity-100"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}

              {newFiles.map((pending, i) => (
                <div
                  key={`${pending.file.name}-${i}`}
                  className={`group relative ${A4_ASPECT} overflow-hidden rounded-lg border-2 border-dashed border-brand-300 bg-brand-50/40`}
                  title={`${pending.file.name} · ${formatSize(pending.file.size)}`}
                >
                  {pending.previewUrl ? (
                    <img src={pending.previewUrl} alt={pending.file.name} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-2 text-center">
                      <FileText className="size-6 shrink-0 text-danger" />
                      <span className="line-clamp-3 text-[10px] leading-tight text-slate-500">{pending.file.name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removePendingFile(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-black/80 cursor-pointer group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex ${A4_ASPECT} flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-brand-300 hover:text-brand-500 cursor-pointer`}
              >
                <Image className="size-5" />
                <span className="text-[11px] font-medium">Add file</span>
              </button>
            </div>

            <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} multiple className="hidden" onChange={handleFilesPicked} />
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

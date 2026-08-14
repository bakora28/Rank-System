import { useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Check, ChevronLeft, ChevronRight, Clock, FileText, ImageOff, Receipt, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { listBooks } from '@/api/categories';
import { markBookBought } from '@/api/purchaseRequests';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import type { Book } from '@/types';

const RECEIPT_FILE_TYPES = '.png,.jpg,.jpeg,.pdf';

const STATUS_META = {
  pending: { label: 'Pending review', tone: 'warning' as const, icon: Clock },
  approved: { label: 'Approved', tone: 'success' as const, icon: Check },
  rejected: { label: 'Rejected', tone: 'danger' as const, icon: X },
};

function isPdf(mime: string) {
  return mime === 'application/pdf';
}

function BookCover({ book, onOpen }: { book: Book; onOpen: () => void }) {
  const images = book.files?.filter((f) => !isPdf(f.mime_type)) ?? [];
  const pdfs = book.files?.filter((f) => isPdf(f.mime_type)) ?? [];
  const cover = images[0];
  const hasFiles = images.length > 0 || pdfs.length > 0;
  const color = book.category?.color ?? '#2f8fe0';

  return (
    <div className="flex aspect-[4/3] w-full">
      {/* Spine */}
      <div
        className="relative w-3.5 shrink-0 bg-[image:repeating-linear-gradient(180deg,rgba(0,0,0,0.12)_0px,rgba(0,0,0,0.12)_1px,transparent_1px,transparent_4px)] shadow-[inset_-3px_0_4px_rgba(0,0,0,0.25)]"
        style={{ background: `color-mix(in srgb, ${color} 65%, #0f172a)` }}
      />

      {/* Cover */}
      <button
        type="button"
        onClick={onOpen}
        disabled={!hasFiles}
        className="group relative block flex-1 overflow-hidden shadow-[inset_3px_0_6px_rgba(0,0,0,0.15)] disabled:cursor-default"
      >
        {cover ? (
          <>
            <img
              src={cover.url}
              alt={book.name}
              className="h-full w-full object-cover object-top transition-transform duration-300 group-enabled:group-hover:scale-105"
            />
            {/* Subtle depth + glossy-cover finish */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.22)_0%,transparent_28%)]" />
          </>
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-2.5 p-4 text-center"
            style={{ background: `linear-gradient(150deg, ${color}, color-mix(in srgb, ${color} 55%, #0f172a))` }}
          >
            <BookOpen className="size-7 text-white/60" />
            <p className="line-clamp-3 font-serif text-sm font-semibold leading-snug text-white/90">{book.name}</p>
          </div>
        )}

        {hasFiles && <div className="absolute inset-0 bg-slate-900/0 transition-colors duration-200 group-hover:bg-slate-900/10" />}

        {images.length > 1 && (
          <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
            +{images.length - 1}
          </span>
        )}

        {pdfs.length > 0 && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-medium text-slate-600 shadow-sm">
            <FileText className="size-3 text-danger" /> {pdfs.length > 1 ? `${pdfs.length} PDFs` : 'PDF'}
          </span>
        )}
      </button>

      {/* Page edge */}
      <div className="w-1.5 shrink-0 bg-[image:repeating-linear-gradient(180deg,#e2e8f0_0px,#e2e8f0_2px,#f8fafc_2px,#f8fafc_3px)]" />
    </div>
  );
}

function BookGalleryModal({ book, onClose }: { book: Book; onClose: () => void }) {
  const images = book.files?.filter((f) => !isPdf(f.mime_type)) ?? [];
  const pdfs = book.files?.filter((f) => isPdf(f.mime_type)) ?? [];
  const [index, setIndex] = useState(0);
  const active = images[index];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
          className="relative z-10 flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h3 className="truncate text-base font-semibold text-slate-800">{book.name}</h3>
            <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer">
              <X className="size-4" />
            </button>
          </div>

          {images.length > 0 ? (
            <div className="relative bg-slate-50">
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={active?.id}
                    src={active?.url}
                    alt={active?.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full w-full object-contain"
                  />
                </AnimatePresence>

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-600 shadow-md hover:bg-white cursor-pointer"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      onClick={() => setIndex((i) => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-600 shadow-md hover:bg-white cursor-pointer"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-3">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setIndex(i)}
                      className={`size-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors cursor-pointer ${
                        i === index ? 'border-brand-500' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 px-5 py-10 text-slate-400">
              <ImageOff className="size-8" />
              <p className="text-sm">No images uploaded for this book yet.</p>
            </div>
          )}

          {pdfs.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-slate-100 px-5 py-4">
              <p className="mb-1 text-xs font-medium text-slate-500">Documents</p>
              {pdfs.map((pdf) => (
                <a
                  key={pdf.id}
                  href={pdf.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-600 hover:border-brand-200 hover:bg-brand-50/40 hover:text-brand-700"
                >
                  <FileText className="size-4 shrink-0 text-danger" />
                  <span className="truncate">{pdf.name}</span>
                </a>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function MarkBoughtModal({
  book,
  onClose,
  onSubmit,
  loading,
}: {
  book: Book;
  onClose: () => void;
  onSubmit: (receipt: File, note: string) => void;
  loading: boolean;
}) {
  const [receipt, setReceipt] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Modal
      open
      onClose={onClose}
      title={`Mark "${book.name}" as bought`}
      width={480}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" loading={loading} disabled={!receipt} onClick={() => receipt && onSubmit(receipt, note)}>
            Submit for approval
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-xs font-medium text-slate-600">Purchase receipt (required)</p>
          <input ref={fileInputRef} type="file" accept={RECEIPT_FILE_TYPES} className="hidden" onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} />

          {receipt ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-brand-200 bg-brand-50/40 px-3 py-2.5">
              <span className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                {receipt.type === 'application/pdf' ? (
                  <FileText className="size-4 shrink-0 text-slate-400" />
                ) : (
                  <Receipt className="size-4 shrink-0 text-slate-400" />
                )}
                <span className="truncate">{receipt.name}</span>
              </span>
              <button onClick={() => setReceipt(null)} className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-danger cursor-pointer">
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-slate-200 px-4 py-6 text-slate-400 hover:border-brand-300 hover:text-brand-500 cursor-pointer"
            >
              <Upload className="size-5" />
              <span className="text-xs font-medium">Upload receipt (PNG, JPG, or PDF)</span>
            </button>
          )}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-600">Note to admin (optional)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Bought from the school bookstore on receipt #123"
            rows={3}
            maxLength={500}
            className="resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </label>
      </div>
    </Modal>
  );
}

export default function TeacherCategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);
  const queryClient = useQueryClient();
  const [viewing, setViewing] = useState<Book | null>(null);
  const [marking, setMarking] = useState<Book | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['books', categoryId],
    queryFn: () => listBooks(categoryId),
  });

  const mutation = useMutation({
    mutationFn: ({ bookId, receipt, note }: { bookId: number; receipt: File; note: string }) => markBookBought(bookId, receipt, note || undefined),
    onSuccess: () => {
      toast.success('Marked as bought — waiting for admin approval.');
      queryClient.invalidateQueries({ queryKey: ['books', categoryId] });
      setMarking(null);
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

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((book, i) => {
          const meta = book.my_status ? STATUS_META[book.my_status] : null;
          const Icon = meta?.icon;
          return (
            <motion.div key={book.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                <BookCover book={book} onOpen={() => setViewing(book)} />
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-700">{book.name}</p>
                    {meta && (
                      <Badge tone={meta.tone} className="mt-1.5">
                        {Icon && <Icon className="size-3" />} {meta.label}
                      </Badge>
                    )}
                  </div>
                  {!book.my_status && (
                    <Button size="sm" onClick={() => setMarking(book)}>
                      Mark bought
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {viewing && <BookGalleryModal book={viewing} onClose={() => setViewing(null)} />}

      {marking && (
        <MarkBoughtModal
          book={marking}
          loading={mutation.isPending}
          onClose={() => setMarking(null)}
          onSubmit={(receipt, note) => mutation.mutate({ bookId: marking.id, receipt, note })}
        />
      )}
    </div>
  );
}

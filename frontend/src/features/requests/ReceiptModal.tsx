import { FileText, StickyNote } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { PurchaseRequestItem } from '@/types';

function isPdfUrl(url: string) {
  return url.toLowerCase().endsWith('.pdf');
}

export function ReceiptModal({
  request,
  onClose,
  title,
}: {
  request: PurchaseRequestItem | null;
  onClose: () => void;
  title?: (request: PurchaseRequestItem) => string;
}) {
  const isPdf = request?.receipt_url ? isPdfUrl(request.receipt_url) : false;

  return (
    <Modal open={!!request} onClose={onClose} title={request ? (title ? title(request) : `Receipt — ${request.book.name}`) : 'Receipt'} width={480}>
      {request && (
        <div className="flex flex-col gap-4">
          {request.receipt_url ? (
            isPdf ? (
              <a
                href={request.receipt_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-slate-100 px-4 py-3 text-sm text-slate-600 hover:border-brand-200 hover:bg-brand-50/40 hover:text-brand-700"
              >
                <FileText className="size-4 shrink-0 text-danger" /> Open receipt PDF
              </a>
            ) : (
              <a href={request.receipt_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-100">
                <img src={request.receipt_url} alt="Purchase receipt" className="max-h-[60vh] w-full object-contain bg-slate-50" />
              </a>
            )
          ) : (
            <p className="text-sm text-slate-400">No receipt was attached.</p>
          )}

          <div className="text-sm text-slate-600">
            <span className="font-medium text-slate-700">{request.book.name}</span> · {request.book.category}
          </div>

          {request.teacher_note && (
            <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
              <StickyNote className="size-4 shrink-0 text-slate-400" />
              <p>{request.teacher_note}</p>
            </div>
          )}

          {request.note && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
              <StickyNote className="size-4 shrink-0 text-amber-400" />
              <p>
                <span className="font-medium">Admin note:</span> {request.note}
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

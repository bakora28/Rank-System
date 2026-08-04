import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface Props {
  page: number;
  lastPage: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, lastPage, onChange }: Props) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="size-4" />
      </Button>
      <span className="text-xs font-medium text-slate-500">
        Page {page} of {lastPage}
      </span>
      <Button variant="ghost" size="sm" disabled={page >= lastPage} onClick={() => onChange(page + 1)}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

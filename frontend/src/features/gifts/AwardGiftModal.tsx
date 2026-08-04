import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { globalSearch } from '@/api/search';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import type { Gift } from '@/types';

interface Props {
  gift: Gift | null;
  loading: boolean;
  onClose: () => void;
  onAward: (userId: number) => void;
}

export function AwardGiftModal({ gift, loading, onClose, onAward }: Props) {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<{ id: number; name: string } | null>(null);
  const debouncedQ = useDebouncedValue(q, 300);

  const { data } = useQuery({
    queryKey: ['award-search', debouncedQ],
    queryFn: () => globalSearch(debouncedQ),
    enabled: debouncedQ.length > 0,
  });

  return (
    <Modal
      open={!!gift}
      onClose={onClose}
      title={`Award "${gift?.name}"`}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" loading={loading} disabled={!selected} onClick={() => selected && onAward(selected.id)}>
            Award gift
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {selected ? (
          <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <Avatar name={selected.name} size={28} />
              <span className="text-sm font-medium text-slate-700">{selected.name}</span>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs font-medium text-brand-600 cursor-pointer">
              Change
            </button>
          </div>
        ) : (
          <>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search teacher by name..."
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-100">
              {data?.teachers.length === 0 && q && <p className="px-3 py-3 text-sm text-slate-400">No teachers found</p>}
              {data?.teachers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 cursor-pointer"
                >
                  <Avatar name={t.name} size={28} />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

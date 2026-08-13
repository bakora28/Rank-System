import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Gift, GiftCriteriaType, GiftPeriod } from '@/types';
import type { GiftPayload } from '@/api/gifts';

interface Props {
  open: boolean;
  gift: Gift | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (payload: GiftPayload) => void;
}

export function GiftFormModal({ open, gift, loading, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteriaType, setCriteriaType] = useState<GiftCriteriaType>('manual');
  const [period, setPeriod] = useState<GiftPeriod>('none');
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setName(gift?.name ?? '');
      setDescription(gift?.description ?? '');
      setCriteriaType(gift?.criteria_type ?? 'manual');
      setPeriod(gift?.period ?? 'none');
      setIsActive(gift?.is_active ?? true);
      setImage(null);
    }
  }, [open, gift]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={gift ? 'Edit Gift' : 'New Gift'}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            loading={loading}
            disabled={!name.trim()}
            onClick={() => onSubmit({ name, description, criteria_type: criteriaType, period, is_active: isActive, image })}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AirPods" />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />

        <div className="grid grid-cols-2 gap-4">
          <Select label="Criteria" value={criteriaType} onChange={(e) => setCriteriaType(e.target.value as GiftCriteriaType)}>
            <option value="manual">Manual award</option>
            <option value="period_top1">Automatic — top 1 per period</option>
          </Select>
          <div>
            <Select label="Period" value={period} onChange={(e) => setPeriod(e.target.value as GiftPeriod)}>
              <option value="none">None</option>
              <option value="6_months">Every 6 months</option>
              <option value="yearly">Yearly</option>
            </Select>
            {criteriaType === 'manual' && <p className="mt-1 text-[11px] text-slate-400">Only used when Criteria is set to Automatic.</p>}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-slate-600">Image</span>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} className="text-sm" />
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4 accent-brand-500" />
          Active
        </label>
      </div>
    </Modal>
  );
}

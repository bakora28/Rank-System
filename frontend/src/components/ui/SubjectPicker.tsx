import { Calculator, FlaskConical } from 'lucide-react';
import { clsx } from 'clsx';
import type { Subject } from '@/types';

const OPTIONS: { value: Subject; label: string; description: string; icon: typeof Calculator }[] = [
  { value: 'maths', label: 'Maths', description: 'Algebra, geometry, calculus & more', icon: Calculator },
  { value: 'science', label: 'Science', description: 'Chemistry, physics, biology & general science', icon: FlaskConical },
];

export function SubjectPicker({ value, onChange, label = 'Subject' }: { value: Subject | null; onChange: (value: Subject) => void; label?: string }) {
  return (
    <div>
      {label && <span className="text-xs font-medium text-slate-600">{label}</span>}
      <div className={clsx('grid grid-cols-2 gap-3', label && 'mt-1.5')}>
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const selected = value === opt.value;
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={clsx(
                'flex flex-col items-start gap-2 rounded-xl border-2 p-3.5 text-left transition-colors cursor-pointer',
                selected ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <Icon className={clsx('size-5', selected ? 'text-brand-600' : 'text-slate-400')} />
              <div>
                <p className={clsx('text-sm font-semibold', selected ? 'text-brand-700' : 'text-slate-700')}>{opt.label}</p>
                <p className="text-[11px] leading-snug text-slate-400">{opt.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

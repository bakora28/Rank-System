import { AnimatedNumber } from './AnimatedNumber';

export interface StatStripItem {
  label: string;
  value: number;
  suffix?: string;
}

export function StatStrip({ items }: { items: StatStripItem[] }) {
  return (
    <div className="flex flex-wrap divide-x divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-white">
      {items.map((item) => (
        <div key={item.label} className="min-w-[140px] flex-1 px-5 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{item.label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            <AnimatedNumber value={item.value} />
            {item.suffix}
          </p>
        </div>
      ))}
    </div>
  );
}

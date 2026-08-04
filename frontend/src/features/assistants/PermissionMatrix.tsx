import { clsx } from 'clsx';
import { PERMISSION_ACTIONS, PERMISSION_MODULES, type Permission } from '@/types';

const MODULE_LABEL: Record<string, string> = {
  categories: 'Categories',
  books: 'Books',
  teachers: 'Teachers',
  requests: 'Purchase Requests',
  gifts: 'Gifts',
  notifications: 'Notifications',
};

export function PermissionMatrix({ value, onChange }: { value: Permission[]; onChange: (perms: Permission[]) => void }) {
  function toggle(perm: Permission) {
    onChange(value.includes(perm) ? value.filter((p) => p !== perm) : [...value, perm]);
  }

  function toggleRow(module: string) {
    const rowPerms = PERMISSION_ACTIONS.map((a) => `${module}.${a}` as Permission);
    const allOn = rowPerms.every((p) => value.includes(p));
    onChange(allOn ? value.filter((p) => !rowPerms.includes(p)) : Array.from(new Set([...value, ...rowPerms])));
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
            <th className="px-4 py-2.5">Module</th>
            {PERMISSION_ACTIONS.map((a) => (
              <th key={a} className="px-2 py-2.5 text-center capitalize">
                {a}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_MODULES.map((module) => (
            <tr key={module} className="border-b border-slate-50 last:border-0">
              <td className="px-4 py-2.5">
                <button
                  onClick={() => toggleRow(module)}
                  className="text-sm font-medium text-slate-700 hover:text-brand-600 cursor-pointer"
                >
                  {MODULE_LABEL[module]}
                </button>
              </td>
              {PERMISSION_ACTIONS.map((action) => {
                const perm = `${module}.${action}` as Permission;
                const checked = value.includes(perm);
                return (
                  <td key={action} className="px-2 py-2.5 text-center">
                    <button
                      onClick={() => toggle(perm)}
                      className={clsx(
                        'size-5 rounded-md border transition-colors cursor-pointer',
                        checked ? 'border-brand-500 bg-brand-500' : 'border-slate-300 bg-white hover:border-brand-300'
                      )}
                      aria-label={perm}
                    >
                      {checked && (
                        <svg viewBox="0 0 16 16" className="size-full p-0.5 text-white" fill="none">
                          <path d="M3 8.5 6.5 12 13 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

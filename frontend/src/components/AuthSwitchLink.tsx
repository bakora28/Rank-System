import { Link } from 'react-router-dom';

export function AuthSwitchLink({ question, linkText, to }: { question: string; linkText: string; to: string }) {
  return (
    <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
      <span className="hidden sm:inline">{question}</span>
      <Link
        to={to}
        className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-600"
      >
        {linkText}
      </Link>
    </div>
  );
}

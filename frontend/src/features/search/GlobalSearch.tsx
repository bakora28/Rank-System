import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, User, BookOpen, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { globalSearch } from '@/api/search';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export function GlobalSearch() {
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useClickOutside(ref, () => setOpen(false));

  const debounced = useDebouncedValue(term, 300);

  const { data, isFetching } = useQuery({
    queryKey: ['global-search', debounced],
    queryFn: () => globalSearch(debounced),
    enabled: debounced.length > 0,
  });

  const hasResults = data && (data.teachers.length > 0 || data.books.length > 0 || data.categories.length > 0);

  return (
    <div className="relative w-full max-w-sm" ref={ref}>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-brand-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100">
        <Search className="size-4 text-slate-400" />
        <input
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search teachers, books, categories..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <AnimatePresence>
        {open && term.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 z-40 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-xl"
          >
            {isFetching && <p className="px-4 py-4 text-sm text-slate-400">Searching...</p>}

            {!isFetching && !hasResults && <p className="px-4 py-4 text-sm text-slate-400">No results for "{term}"</p>}

            {data && data.teachers.length > 0 && (
              <SearchSection title="Teachers" icon={<User className="size-3.5" />}>
                {data.teachers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setOpen(false);
                      navigate(`/admin/teachers?q=${encodeURIComponent(t.name)}`);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {t.name} <span className="text-xs text-slate-400">{t.email}</span>
                  </button>
                ))}
              </SearchSection>
            )}

            {data && data.categories.length > 0 && (
              <SearchSection title="Categories" icon={<FolderOpen className="size-3.5" />}>
                {data.categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setOpen(false);
                      navigate(`/admin/categories/${c.id}`);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {c.name}
                  </button>
                ))}
              </SearchSection>
            )}

            {data && data.books.length > 0 && (
              <SearchSection title="Books" icon={<BookOpen className="size-3.5" />}>
                {data.books.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setOpen(false);
                      navigate(`/admin/categories/${b.category_id}`);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {b.name} <span className="text-xs text-slate-400">{b.category?.name}</span>
                  </button>
                ))}
              </SearchSection>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-50 py-1.5 last:border-0">
      <p className="flex items-center gap-1.5 px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}

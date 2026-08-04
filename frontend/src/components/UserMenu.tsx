import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/api/auth';
import { useAuthStore } from '@/store/auth';
import { useClickOutside } from '@/hooks/useClickOutside';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

const ROLE_LABEL: Record<string, string> = { admin: 'Admin', teacher: 'Teacher', assistant: 'Assistant' };

export function UserMenu({ variant = 'header' }: { variant?: 'header' | 'sidebar' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useClickOutside(ref, () => setOpen(false));

  if (!user) return null;

  async function handleLogout() {
    await logout();
    setUser(null);
    queryClient.clear();
    navigate('/login');
  }

  if (variant === 'sidebar') {
    return (
      <div className="relative" ref={ref}>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-x-0 bottom-full z-40 mb-2 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl"
            >
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-danger hover:bg-red-50 cursor-pointer"
              >
                <LogOut className="size-4" /> Log out
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-slate-50 cursor-pointer"
        >
          <Avatar name={user.name} src={user.avatar} size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-700">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{ROLE_LABEL[user.role]}</p>
          </div>
          {open ? <ChevronUp className="size-3.5 text-slate-400" /> : <ChevronDown className="size-3.5 text-slate-400" />}
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className={clsx('flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-slate-100 cursor-pointer')}>
        <Avatar name={user.name} src={user.avatar} size={32} />
        <span className="hidden text-sm font-medium text-slate-700 sm:block">{user.name.split(' ')[0]}</span>
        <ChevronDown className="size-3.5 text-slate-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl"
          >
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
              <Badge tone="brand" className="mt-2">
                {ROLE_LABEL[user.role]}
              </Badge>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-danger hover:bg-red-50 cursor-pointer"
            >
              <LogOut className="size-4" /> Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

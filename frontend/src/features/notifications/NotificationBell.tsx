import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '@/api/notifications';
import { useClickOutside } from '@/hooks/useClickOutside';
import { timeAgo } from '@/lib/timeAgo';
import { useAuthStore } from '@/store/auth';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => !!s.user);
  useClickOutside(ref, () => setOpen(false));

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 20_000,
    enabled: isAuthenticated,
  });

  const unread = data?.unread_count ?? 0;

  async function handleMarkAll() {
    await markAllNotificationsRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }

  async function handleItemClick(id: string, readAt: string | null) {
    if (!readAt) {
      await markNotificationRead(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 cursor-pointer"
      >
        <motion.span animate={unread > 0 ? { rotate: [0, -12, 10, -8, 0] } : {}} transition={{ duration: 0.6 }}>
          <Bell className="size-[18px]" />
        </motion.span>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white"
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <span className="text-sm font-semibold text-slate-700">Notifications</span>
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 cursor-pointer"
                >
                  <CheckCheck className="size-3.5" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {!data || data.data.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-slate-400">No notifications yet</p>
              ) : (
                data.data.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleItemClick(n.id, n.read_at)}
                    className={`block w-full border-b border-slate-50 px-4 py-3 text-left text-sm transition-colors hover:bg-slate-50 cursor-pointer ${
                      n.read_at ? 'text-slate-500' : 'bg-brand-50/40 text-slate-700 font-medium'
                    }`}
                  >
                    <p>{n.data.message}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{timeAgo(n.created_at)}</p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

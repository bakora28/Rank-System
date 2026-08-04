import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Trophy,
  ClipboardList,
  BookOpen,
  Users,
  ShieldCheck,
  Crown,
  Gift,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { GlobalSearch } from '@/features/search/GlobalSearch';
import { UserMenu } from '@/components/UserMenu';
import type { Permission } from '@/types';
import logoFull from '@/assets/logo-full.png';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  permission?: Permission;
  adminOnly?: boolean;
}

const TEACHER_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/teacher', icon: LayoutDashboard },
  { label: 'Categories', to: '/teacher/categories', icon: BookOpen },
  { label: 'Gifts', to: '/teacher/gifts', icon: Gift },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Ranks', to: '/admin/ranks', icon: Trophy },
  { label: 'Requests', to: '/admin/requests', icon: ClipboardList, permission: 'requests.view' },
  { label: 'Categories', to: '/admin/categories', icon: BookOpen, permission: 'categories.view' },
  { label: 'Teachers', to: '/admin/teachers', icon: Users, permission: 'teachers.view' },
  { label: 'Assistants', to: '/admin/assistants', icon: ShieldCheck, adminOnly: true },
  { label: 'Admins', to: '/admin/admins', icon: Crown, adminOnly: true },
  { label: 'Gifts', to: '/admin/gifts', icon: Gift, permission: 'gifts.view' },
];

function SidebarContent({ navItems, isTeacher, onNavigate }: { navItems: NavItem[]; isTeacher: boolean; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <a href={isTeacher ? '/teacher' : '/admin'} className="flex items-center px-5 py-6">
        <img src={logoFull} alt="TeacherPlanet" className="h-14 w-auto" />
      </a>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/teacher' || item.to === '/admin'}
            onClick={onNavigate}
            className="relative block"
          >
            {({ isActive }) => (
              <div
                className={clsx(
                  'relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'text-brand-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 rounded-xl bg-brand-50"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <item.icon className="relative z-10 size-[18px]" />
                <span className="relative z-10">{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <UserMenu variant="sidebar" />
      </div>
    </div>
  );
}

export function DashboardLayout() {
  const { user, can } = useAuthStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const isTeacher = user.role === 'teacher';
  const navItems = (isTeacher ? TEACHER_NAV : ADMIN_NAV).filter((item) => {
    if (item.adminOnly) return user.role === 'admin';
    if (item.permission) return can(item.permission);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f6f6fb] lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-100 bg-white lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent navItems={navItems} isTeacher={isTeacher} />
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-100 bg-white lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-6 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
              <SidebarContent navItems={navItems} isTeacher={isTeacher} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 cursor-pointer lg:hidden"
            >
              <Menu className="size-5" />
            </button>

            {!isTeacher ? (
              <div className="hidden flex-1 md:block">
                <GlobalSearch />
              </div>
            ) : (
              <div className="flex-1" />
            )}
            <div className="flex-1 md:hidden" />

            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mx-auto max-w-6xl"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { googleLoginUrl } from '@/api/client';

const GoogleG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="m6.3 14.7 6.6 4.8C14.7 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.4 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 45c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.7 36.1 27 37 24 37c-5.2 0-9.7-3.3-11.3-8H6v6.3C9.4 40.6 16.1 45 24 45z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.5.001 0 .001 0 6.6 5.6C41.8 35.7 45 30.4 45 24c0-1.2-.1-2.4-.4-3.5z"
    />
  </svg>
);

export function GoogleButton({ variant = 'full' }: { variant?: 'full' | 'circle' }) {
  if (variant === 'circle') {
    return (
      <motion.a
        whileHover={{ y: -2, boxShadow: '0 6px 16px rgba(16, 24, 40, 0.12)' }}
        whileTap={{ scale: 0.95 }}
        href={googleLoginUrl()}
        aria-label="Continue with Google"
        className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"
      >
        <GoogleG className="size-5" />
      </motion.a>
    );
  }

  return (
    <motion.a
      whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(16, 24, 40, 0.08)' }}
      whileTap={{ scale: 0.98 }}
      href={googleLoginUrl()}
      className={clsx(
        'flex w-full items-center justify-center gap-2.5 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50'
      )}
    >
      <GoogleG className="size-4" />
      Continue with Google
    </motion.a>
  );
}

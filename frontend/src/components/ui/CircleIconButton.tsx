import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface Props {
  icon: ReactNode;
  variant?: 'outline' | 'dark';
  size?: number;
  onClick?: () => void;
  className?: string;
  as?: 'button' | 'div';
}

export function CircleIconButton({ icon, variant = 'outline', size = 36, onClick, className, as = 'button' }: Props) {
  const Component = motion[as === 'button' ? 'button' : 'div'];

  return (
    <Component
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      style={{ width: size, height: size }}
      className={clsx(
        'flex shrink-0 items-center justify-center rounded-full transition-colors',
        variant === 'outline' && 'border border-slate-200 text-slate-500 hover:border-brand-300 hover:text-brand-600',
        variant === 'dark' && 'bg-slate-900 text-white hover:bg-slate-800',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {icon}
    </Component>
  );
}

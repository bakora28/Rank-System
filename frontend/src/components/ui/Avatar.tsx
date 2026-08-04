import { clsx } from 'clsx';

interface Props {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

const PALETTE = ['#2f8fe0', '#8e44ad', '#27ae60', '#e67e22', '#16a085', '#e0473f', '#1f70c2'];

function colorFor(name: string) {
  const idx = name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % PALETTE.length;
  return PALETTE[idx];
}

export function Avatar({ name, src, size = 36, className }: Props) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className={clsx('rounded-full object-cover shrink-0', className)}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, background: colorFor(name), fontSize: size * 0.38 }}
      className={clsx('rounded-full flex items-center justify-center font-semibold text-white shrink-0', className)}
    >
      {initials || '?'}
    </div>
  );
}

import { motion } from 'framer-motion';
import type { ActivityPoint } from '@/api/ranks';

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  const width = 560;
  const height = 160;
  const padding = 24;
  const max = Math.max(1, ...data.map((d) => d.count));
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const barWidth = Math.min(28, step * 0.4);

  const points = data.map((d, i) => {
    const x = padding + i * step;
    const y = height - padding - (d.count / max) * (height - padding * 2 - 10);
    return { x, y, d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {points.map((p, i) => (
        <motion.rect
          key={p.d.date}
          x={p.x - barWidth / 2}
          width={barWidth}
          rx={6}
          fill="url(#barGradient)"
          initial={{ height: 0, y: height - padding }}
          animate={{ height: height - padding - p.y, y: p.y }}
          transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
        />
      ))}

      <motion.path
        d={linePath}
        fill="none"
        stroke="#4f46e5"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />

      {points.map((p, i) => (
        <motion.circle
          key={`dot-${p.d.date}`}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="#4f46e5"
          stroke="white"
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 + i * 0.05, type: 'spring', bounce: 0.6 }}
        />
      ))}

      {points.map((p) => (
        <text key={`label-${p.d.date}`} x={p.x} y={height + 14} textAnchor="middle" fontSize={11} fill="#94a3b8">
          {p.d.label}
        </text>
      ))}

      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#c7d2fe" />
        </linearGradient>
      </defs>
    </svg>
  );
}

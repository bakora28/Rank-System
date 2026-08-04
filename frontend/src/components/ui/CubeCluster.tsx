import { motion } from 'framer-motion';

const BLOCKS = [
  { size: 92, x: 10, y: 10, rotate: -8, from: 'from-fuchsia-300', to: 'to-purple-500', delay: 0 },
  { size: 64, x: 78, y: 0, rotate: 12, from: 'from-sky-300', to: 'to-blue-500', delay: 0.4 },
  { size: 56, x: 0, y: 88, rotate: 18, from: 'from-pink-200', to: 'to-fuchsia-400', delay: 0.8 },
  { size: 44, x: 96, y: 84, rotate: -14, from: 'from-white/90', to: 'to-white/60', delay: 1.2 },
  { size: 34, x: 46, y: 118, rotate: 30, from: 'from-violet-300', to: 'to-indigo-500', delay: 0.6 },
];

export function CubeCluster({ className }: { className?: string }) {
  return (
    <div className={className} style={{ position: 'relative', width: 160, height: 160 }}>
      {BLOCKS.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-2xl bg-gradient-to-br ${b.from} ${b.to} shadow-lg`}
          style={{ width: b.size, height: b.size, left: b.x, top: b.y, rotate: b.rotate }}
          animate={{ y: [0, -8, 0], rotate: [b.rotate, b.rotate + 4, b.rotate] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: b.delay }}
        />
      ))}
    </div>
  );
}

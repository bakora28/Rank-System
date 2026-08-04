import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function FloatingIcon({ icon, className }: { icon: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {icon}
    </motion.div>
  );
}

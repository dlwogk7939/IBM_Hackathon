'use client';

import { motion } from 'framer-motion';
import { cn } from '../../_lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function GlassCard({ children, className, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={cn('glass-card p-5', className)}
    >
      {children}
    </motion.div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LiveReaction } from '@/lib/livestream/types';

interface FloatingReactionsProps {
  reactions: LiveReaction[];
}

export function FloatingReactions({ reactions }: FloatingReactionsProps) {
  const [visible, setVisible] = useState<LiveReaction[]>([]);

  useEffect(() => {
    if (reactions.length === 0) return;
    const latest = reactions[reactions.length - 1];
    setVisible((prev) => [...prev.slice(-20), latest]);

    const timer = setTimeout(() => {
      setVisible((prev) => prev.filter((r) => r.id !== latest.id));
    }, 3000);

    return () => clearTimeout(timer);
  }, [reactions]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {visible.map((reaction) => (
          <motion.span
            key={reaction.id}
            className="absolute bottom-24 select-none text-3xl"
            style={{ left: `${reaction.x}%` }}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -160, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.8, ease: 'easeOut' }}
          >
            {reaction.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

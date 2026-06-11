import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  color: string;
  left: string;
  delay: string;
}

interface ParticleLayerProps {
  particles: Particle[];
}

export function ParticleLayer({ particles }: ParticleLayerProps) {
  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((par) => (
            <motion.div
              key={par.id}
              className={`absolute w-2 h-2 rounded-full ${par.color}`}
              style={{ left: par.left }}
              initial={{ y: -20, rotate: 0, opacity: 1 }}
              animate={{ y: window.innerHeight + 50, rotate: 360, opacity: [1, 1, 0] }}
              transition={{ duration: 2.5, ease: 'easeOut', delay: parseFloat(par.delay) }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

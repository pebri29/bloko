import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard = ({ children, className, hover = true }: GlassCardProps) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.01 } : {}}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-xl shadow-black/5 p-6",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

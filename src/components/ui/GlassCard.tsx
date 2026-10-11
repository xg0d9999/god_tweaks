import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  onClick,
  hoverEffect = true,
}) => {
  return (
    <motion.div
      whileHover={
        hoverEffect
          ? {
              y: -2,
              borderColor: "rgba(255, 255, 255, 0.16)",
              transition: { duration: 0.2 },
            }
          : undefined
      }
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-[#0E1013]/60 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.45)] ${className}`}
    >
      {/* Subtle top specular sheen */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};

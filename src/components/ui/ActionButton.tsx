import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "neon";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  title?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  variant = "secondary",
  disabled = false,
  loading = false,
  icon,
  className = "",
  size = "md",
  title,
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5 font-medium",
    md: "px-3.5 py-2 text-xs rounded-xl gap-2 font-medium",
    lg: "px-5 py-2.5 text-sm rounded-xl gap-2 font-medium",
  };

  const variantClasses = {
    primary:
      "bg-white text-[#090A0C] hover:bg-[#EDEDED] border border-white/20 shadow-[0_1px_3px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)]",
    secondary:
      "bg-white/[0.05] hover:bg-white/[0.08] active:bg-white/[0.03] text-[#E1E4EA] hover:text-white border border-white/[0.08] hover:border-white/[0.16] shadow-sm",
    danger:
      "bg-rose-500/10 hover:bg-rose-500/15 text-rose-300 border border-rose-500/20",
    ghost:
      "bg-transparent hover:bg-white/[0.05] text-[#8A8F98] hover:text-[#EDEDED] border border-transparent",
    neon:
      "bg-white text-[#090A0C] hover:bg-[#EDEDED] border border-white/20 shadow-[0_1px_4px_rgba(0,0,0,0.5)]",
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      whileHover={
        disabled || loading
          ? undefined
          : { scale: 1.005, transition: { duration: 0.15 } }
      }
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`inline-flex items-center justify-center transition-all duration-150 focus:outline-none select-none ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </motion.button>
  );
};

import React from "react";
import { SafetyLevel } from "../../types";

interface BadgeProps {
  level: SafetyLevel;
}

export const Badge: React.FC<BadgeProps> = ({ level }) => {
  const styles: Record<SafetyLevel, string> = {
    Seguro: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Gaming: "bg-white/[0.06] text-[#D0D4DC] border-white/[0.1]",
    Extremo: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  };

  const dots: Record<SafetyLevel, string> = {
    Seguro: "bg-emerald-400",
    Gaming: "bg-[#A0A6B2]",
    Extremo: "bg-rose-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-tight border ${styles[level]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[level]}`} />
      {level}
    </span>
  );
};

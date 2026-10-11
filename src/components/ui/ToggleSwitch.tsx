import React from "react";
import { motion } from "framer-motion";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border transition-all duration-300 focus:outline-none items-center backdrop-blur-md ${
        disabled ? "opacity-35 cursor-not-allowed" : ""
      } ${
        checked
          ? "bg-white/[0.16] border-white/40 shadow-[0_0_14px_rgba(255,255,255,0.2),inset_0_1px_1px_rgba(255,255,255,0.3)]"
          : "bg-white/[0.04] border-white/[0.1] hover:border-white/[0.18] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]"
      }`}
    >
      {/* Ambient glass glow when active */}
      {checked && (
        <span className="absolute inset-0 rounded-full bg-white/[0.08] blur-sm pointer-events-none" />
      )}

      {/* Radiant Glass Knob with Spring Physics */}
      <motion.span
        initial={false}
        animate={{ x: checked ? 21 : 3 }}
        transition={{
          type: "spring",
          stiffness: 550,
          damping: 30,
        }}
        className={`pointer-events-none relative z-10 inline-block h-4 w-4 rounded-full transition-all duration-300 ${
          checked
            ? "bg-gradient-to-b from-white via-[#F5F5F7] to-[#E0E2E6] border border-white/90 shadow-[0_0_10px_rgba(255,255,255,0.65),0_2px_4px_rgba(0,0,0,0.5)]"
            : "bg-white/40 border border-white/20 shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
        }`}
      />
    </button>
  );
};

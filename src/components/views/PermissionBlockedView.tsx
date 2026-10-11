import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PermissionBlockedViewProps {
  moduleName: string;
  reason?: string;
  onBackToDashboard: () => void;
}

export const PermissionBlockedView: React.FC<PermissionBlockedViewProps> = ({
  moduleName,
  reason,
  onBackToDashboard,
}) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center select-none bg-[#0a0c0f]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl shadow-2xl flex flex-col items-center space-y-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Acceso Deshabilitado: {moduleName}
          </h2>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            {reason ||
              `La administración de g0d suite ha deshabilitado el acceso a este módulo para tu cuenta.`}
          </p>
        </div>

        {user && (
          <div className="w-full flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs">
            <div className="flex items-center gap-2.5">
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-7 h-7 rounded-full object-cover border border-white/10"
              />
              <span className="text-white font-medium">{user.username}</span>
            </div>
            <span className="font-mono text-[11px] text-[#717680]">ID: {user.id}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] text-[#717680] bg-white/[0.02] px-3 py-2 rounded-xl border border-white/[0.04] w-full text-left">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Si crees que se trata de un error, solicita la activación a un Administrador en Discord.</span>
        </div>

        <div className="pt-2 w-full">
          <button
            onClick={onBackToDashboard}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:scale-98 text-xs font-medium text-white transition-all cursor-pointer border border-white/[0.08]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Dashboard</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

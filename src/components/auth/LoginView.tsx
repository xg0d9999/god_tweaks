import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginView: React.FC = () => {
  const { startDiscordOAuth } = useAuth();
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginClick = async () => {
    setErrorMessage(null);
    setIsAuthorizing(true);
    try {
      await startDiscordOAuth();
    } catch (err: any) {
      console.error('Error al autorizar con Discord:', err);
      setErrorMessage(
        err?.message || 'Error al conectar con Discord. Asegúrate de autorizar la aplicación en la ventana oficial.'
      );
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07080A]/95 backdrop-blur-2xl p-6 select-none overflow-hidden">
      {/* Decorative ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-[#5865F2]/15 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative w-full max-w-sm rounded-3xl bg-[#0D0F14]/90 border border-white/[0.1] p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-3xl flex flex-col items-center text-center"
      >
        {/* Subtle top glow line */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#5865F2]/60 to-transparent" />

        {/* Logo */}
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-[#5865F2]/25 rounded-2xl blur-lg" />
          <img
            src="/favicon.png"
            alt="g0d suite logo"
            className="relative w-16 h-16 rounded-2xl shadow-xl border border-white/10 object-contain"
          />
        </div>

        {/* Name */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-6">
          g0d suite
        </h1>

        {/* Single 1-Click Discord OAuth Action Button */}
        <button
          onClick={handleLoginClick}
          disabled={isAuthorizing}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl font-semibold text-sm text-white bg-[#5865F2] hover:bg-[#4752C4] shadow-lg shadow-[#5865F2]/30 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
        >
          {isAuthorizing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Conectando con Discord...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <span>Iniciar sesión con Discord</span>
            </>
          )}
        </button>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 text-left w-full"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, HardDrive, Wifi, AlertCircle, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginView: React.FC = () => {
  const { loginWithDiscord, hardware, ipAddress } = useAuth();

  const [discordUsername, setDiscordUsername] = useState('');
  const [discordId, setDiscordId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = discordUsername.trim();
    const cleanId = discordId.trim() || Math.floor(100000000000000000 + Math.random() * 900000000000000000).toString();

    if (!cleanUsername) {
      setErrorMessage('Introduce tu nombre de usuario de Discord.');
      return;
    }

    try {
      setIsSubmitting(true);
      await loginWithDiscord({
        id: cleanId,
        username: cleanUsername,
        avatar_url: avatarUrl.trim() || undefined,
      });
    } catch (err: any) {
      console.error('Error durante el inicio de sesión:', err);
      setErrorMessage(err?.message || 'Error al conectar con Supabase. Revisa tu conexión a internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6 select-none overflow-hidden">
      {/* Decorative ambient lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="relative w-full max-w-xl rounded-3xl bg-[#0c0d12]/90 border border-white/[0.12] p-8 shadow-2xl backdrop-blur-3xl overflow-hidden"
      >
        {/* Top Glow Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-cyan-300">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>ACCESO EXCLUSIVO // CONTROL TOTAL</span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <img src="/favicon.png" alt="g0d suite logo" className="w-10 h-10 rounded-xl shadow-lg border border-white/10" />
            <h1 className="text-3xl font-extrabold tracking-tight text-white">g0d suite</h1>
          </div>
          <p className="text-xs text-[#828792]">
            Inicia sesión con tu cuenta de Discord para sincronizar tu licencia y registrar tu hardware en Supabase.
          </p>
        </div>

        {/* Hardware & Telemetry Detection Badges */}
        <div className="grid grid-cols-2 gap-2.5 p-3.5 mb-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] font-mono text-[11px]">
          <div className="flex items-center gap-2 text-[#9ea3ae]">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate">HWID: {hardware?.hwid ? `${hardware.hwid.slice(0, 8)}...` : 'Detectando...'}</span>
          </div>
          <div className="flex items-center gap-2 text-[#9ea3ae]">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">IP: {ipAddress || 'Consultando...'}</span>
          </div>
          <div className="flex items-center gap-2 text-[#9ea3ae]">
            <Cpu className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span className="truncate">{hardware?.cpu ? hardware.cpu.split(' ')[0] + ' ' + (hardware.cpu.split(' ')[1] || '') : 'CPU'}</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Supabase Cloud ● Listo</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#c4c8d4]">
              Usuario de Discord <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={discordUsername}
                onChange={(e) => setDiscordUsername(e.target.value)}
                placeholder="ej: xg0d9999 o usuario#0000"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-sm text-white placeholder-[#585c67] focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/50 transition-all font-sans"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#c4c8d4]">
                ID de Discord <span className="text-[10px] text-[#717680]">(Opcional)</span>
              </label>
              <input
                type="text"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                placeholder="ej: 382910492817291029"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-[#585c67] focus:outline-none focus:border-cyan-400/80 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#c4c8d4]">
                URL de Avatar <span className="text-[10px] text-[#717680]">(Opcional)</span>
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://cdn.discordapp.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-white placeholder-[#585c67] focus:outline-none focus:border-cyan-400/80"
              />
            </div>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full relative group mt-2 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-medium text-sm text-white bg-[#5865F2] hover:bg-[#4752C4] shadow-lg shadow-[#5865F2]/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Registrando en Supabase...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span>Entrar a g0d suite con Discord</span>
                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
          <p className="text-[11px] text-[#636875]">
            Tus datos de hardware (HWID, CPU, GPU e IP) se asocian de forma segura a tu cuenta de Discord en Supabase para habilitar las optimizaciones de sistema y el control de licencias.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

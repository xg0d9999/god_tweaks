import React, { useState } from 'react';
import { Shield, KeyRound, User, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { loginStaffAccount } from '../services/supabase';
import { StaffAccount } from '../types';

interface LoginViewProps {
  onLoginSuccess: (staff: StaffAccount) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor introduce tu usuario y contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const account = await loginStaffAccount(username, password);
      onLoginSuccess(account);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Error al iniciar sesión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#07080A] relative overflow-hidden select-none">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back to Home Button */}
        <div className="mb-4 flex items-center justify-start">
          <a
            href="https://godsuite.vercel.app"
            className="inline-flex items-center gap-1.5 text-xs text-[#8B949E] hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la Web Principal (godsuite.vercel.app)</span>
          </a>
        </div>

        {/* Header Icon & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            HispanLife Sanciones
          </h1>
          <p className="text-xs text-[#8B949E] mt-1.5">
            Portal Oficial de Gestión de Staff & Control de Accesos (/panel)
          </p>
        </div>

        {/* Login Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0D0F14]/80 border border-white/10 backdrop-blur-2xl shadow-2xl">
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-2">
                Usuario de Staff
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej: xg0d o tu_usuario"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/60 focus:bg-white/[0.06] transition-all placeholder:text-[#8B949E]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8B949E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/60 focus:bg-white/[0.06] transition-all placeholder:text-[#8B949E]/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-black hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Acceder al Panel</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
            <span className="text-[11px] text-[#8B949E]">
              ¿No tienes cuenta? Solicita tus credenciales al Dueño / SuperAdmin.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Shield,
  LogOut,
  Users,
  UserCog,
  ScrollText,
  Link,
  Crown,
  Check,
  X,
} from 'lucide-react';
import { StaffAccount } from '../types';
import { linkStaffDiscord } from '../services/supabase';

interface NavbarProps {
  activeTab: 'users' | 'staff' | 'logs';
  onTabChange: (tab: 'users' | 'staff' | 'logs') => void;
  currentStaff: StaffAccount;
  onLogout: () => void;
  onStaffUpdated: (updated: StaffAccount) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currentStaff,
  onLogout,
  onStaffUpdated,
}) => {
  const isOwner = currentStaff.role === 'owner';
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);
  const [discordIdInput, setDiscordIdInput] = useState(currentStaff.discord_id || '');
  const [discordUserInput, setDiscordUserInput] = useState(currentStaff.discord_username || '');
  const [isSavingDiscord, setIsSavingDiscord] = useState(false);
  const [discordMsg, setDiscordMsg] = useState<string | null>(null);

  const handleSaveDiscord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discordIdInput.trim() || !discordUserInput.trim()) {
      setDiscordMsg('Por favor completa ambos campos.');
      return;
    }

    setIsSavingDiscord(true);
    setDiscordMsg(null);
    try {
      await linkStaffDiscord(currentStaff.id, discordIdInput, discordUserInput);
      const updated = {
        ...currentStaff,
        discord_id: discordIdInput.trim(),
        discord_username: discordUserInput.trim(),
      };
      onStaffUpdated(updated);
      setDiscordMsg('¡Cuenta vinculada con éxito!');
      setTimeout(() => {
        setIsDiscordModalOpen(false);
        setDiscordMsg(null);
      }, 1200);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setDiscordMsg(err.message);
      } else {
        setDiscordMsg('Error al vincular Discord.');
      }
    } finally {
      setIsSavingDiscord(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#07080A]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  HispanLife Sanciones
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-white/70 border border-white/10 hidden sm:inline-block">
                  Staff Portal
                </span>
              </div>
              <span className="text-[11px] text-[#8B949E] block -mt-0.5">
                Gestión Web de Accesos
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <button
              onClick={() => onTabChange('users')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'text-[#8B949E] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Usuarios</span>
            </button>

            {isOwner && (
              <button
                onClick={() => onTabChange('staff')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'staff'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'text-[#8B949E] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <UserCog className="w-3.5 h-3.5 text-purple-400" />
                <span>Gestión Staff</span>
              </button>
            )}

            <button
              onClick={() => onTabChange('logs')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'text-[#8B949E] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5" />
              <span>Auditoría & Logs</span>
            </button>
          </nav>

          {/* User Profile Pill & Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDiscordModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              title="Vincular o ver perfil de Discord"
            >
              {isOwner ? (
                <Crown className="w-4 h-4 text-amber-400" />
              ) : (
                <Shield className="w-4 h-4 text-emerald-400" />
              )}
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-white block leading-tight">
                  {currentStaff.display_name}
                </span>
                <span className="text-[10px] text-amber-300/90 font-mono block">
                  {isOwner ? 'DUEÑO / SUPERADMIN' : 'STAFF AUTORIZADO'}
                </span>
              </div>
              <Link className="w-3.5 h-3.5 text-[#8B949E] ml-1" />
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/30 text-[#8B949E] hover:text-rose-300 transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Modal Vincular Discord */}
      {isDiscordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0D0F14] border border-white/10 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  <Link className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Vincular con Discord</h3>
                  <span className="text-xs text-[#8B949E]">Asocia tu cuenta de staff a Discord</span>
                </div>
              </div>
              <button
                onClick={() => setIsDiscordModalOpen(false)}
                className="p-1 rounded-lg text-[#8B949E] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDiscord} className="space-y-4">
              {discordMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  {discordMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                  Nombre de Usuario de Discord
                </label>
                <input
                  type="text"
                  value={discordUserInput}
                  onChange={(e) => setDiscordUserInput(e.target.value)}
                  placeholder="ej. carlos_staff"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                  Discord ID (ID de Usuario)
                </label>
                <input
                  type="text"
                  value={discordIdInput}
                  onChange={(e) => setDiscordIdInput(e.target.value)}
                  placeholder="ej. 1103581405096710226"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-indigo-500/50"
                />
                <span className="text-[10px] text-[#8B949E] mt-1 block">
                  Activa el Modo Desarrollador en Discord y haz clic derecho en tu perfil &gt; Copiar ID de usuario.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsDiscordModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#8B949E] hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingDiscord}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isSavingDiscord ? (
                    <span>Guardando...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Guardar Vinculación</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

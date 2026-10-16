import React, { useState, useEffect } from 'react';
import {
  UserCog,
  UserPlus,
  KeyRound,
  Shield,
  Crown,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  X,
  Link,
  ShieldAlert,
} from 'lucide-react';
import { StaffAccount } from '../types';
import {
  getStaffAccounts,
  createStaffAccount,
  changeStaffPassword,
  toggleStaffActiveStatus,
} from '../services/supabase';

interface StaffManagementTabProps {
  currentStaff: StaffAccount;
}

export const StaffManagementTab: React.FC<StaffManagementTabProps> = ({ currentStaff }) => {
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'staff'>('staff');
  const [isCreating, setIsCreating] = useState(false);

  const [passwordModalTarget, setPasswordModalTarget] = useState<StaffAccount | null>(null);
  const [changePasswordInput, setChangePasswordInput] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const isOwner = currentStaff.role === 'owner';

  const showNotification = (text: string, isError = false) => {
    setFeedbackMsg({ text, isError });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3500);
  };

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const data = await getStaffAccounts();
      setStaffList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Handle Create Staff
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newDisplayName.trim() || !newPassword.trim()) {
      showNotification('Por favor completa todos los campos requeridos.', true);
      return;
    }

    setIsCreating(true);
    try {
      const created = await createStaffAccount(
        newUsername,
        newPassword,
        newDisplayName,
        newRole,
        currentStaff
      );
      setStaffList((prev) => [created, ...prev]);
      showNotification(`Cuenta para "${newDisplayName}" creada exitosamente.`);
      setIsCreateModalOpen(false);
      setNewUsername('');
      setNewDisplayName('');
      setNewPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear cuenta staff.';
      showNotification(msg, true);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Change Password (at owner's will)
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalTarget || !changePasswordInput.trim()) {
      showNotification('Introduce la nueva contraseña.', true);
      return;
    }

    setIsChangingPassword(true);
    try {
      await changeStaffPassword(passwordModalTarget.id, changePasswordInput, currentStaff);
      showNotification(
        `Contraseña de "${passwordModalTarget.display_name}" actualizada correctamente.`
      );
      setPasswordModalTarget(null);
      setChangePasswordInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar contraseña.';
      showNotification(msg, true);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Toggle Active/Suspend
  const handleToggleStatus = async (target: StaffAccount) => {
    if (target.role === 'owner') {
      showNotification('¡Acción bloqueada! La cuenta del Dueño no puede ser suspendida.', true);
      return;
    }

    const nextState = !target.is_active;
    try {
      await toggleStaffActiveStatus(target.id, nextState, currentStaff);
      setStaffList((prev) =>
        prev.map((s) => (s.id === target.id ? { ...s, is_active: nextState } : s))
      );
      showNotification(
        `Cuenta de "${target.display_name}" marcada como ${
          nextState ? 'HABILITADA' : 'SUSPENDIDA'
        }.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar estado de cuenta.';
      showNotification(msg, true);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.username.toLowerCase().includes(q) ||
      s.display_name.toLowerCase().includes(q) ||
      (s.discord_username && s.discord_username.toLowerCase().includes(q))
    );
  });

  if (!isOwner) {
    return (
      <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Acceso Restringido</h3>
        <p className="text-xs text-[#8B949E] max-w-md mx-auto">
          Esta sección de gestión de cuentas staff y contraseñas está reservada exclusivamente para el Dueño / SuperAdmin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center gap-2.5 transition-all backdrop-blur-xl ${
            feedbackMsg.isError
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
          }`}
        >
          {feedbackMsg.isError ? (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Administración de Equipo Staff</h2>
          </div>
          <p className="text-xs text-[#8B949E] mt-1">
            Crea cuentas de administrador o staff con la contraseña que quieras y cámbialas cuando lo desees.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.35)] cursor-pointer transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Crear Nueva Cuenta Staff</span>
        </button>
      </div>

      {/* Search & Refresh */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por usuario o nombre..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-[#8B949E]/50 text-xs focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <button
          onClick={fetchStaff}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refrescar</span>
        </button>
      </div>

      {/* Staff Accounts Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0D0F14]/80 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[#8B949E] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Miembro Staff</th>
                <th className="py-3.5 px-4">Rol Asignado</th>
                <th className="py-3.5 px-4">Discord Vinculado</th>
                <th className="py-3.5 px-4">Último Acceso</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-4 text-center">Acciones Dueño</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8B949E]">
                    <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-2" />
                    Cargando cuentas de staff...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8B949E]">
                    No se encontraron cuentas de staff.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const isStaffOwner = staff.role === 'owner';

                  return (
                    <tr
                      key={staff.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isStaffOwner ? 'bg-amber-500/[0.03]' : ''
                      }`}
                    >
                      {/* Name & Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-bold text-purple-300 text-xs">
                            {isStaffOwner ? (
                              <Crown className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Shield className="w-4 h-4 text-purple-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {staff.display_name}
                            </span>
                            <span className="text-[11px] font-mono text-[#8B949E]">
                              @{staff.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {isStaffOwner ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold inline-flex items-center gap-1">
                            <Crown className="w-3 h-3" /> DUEÑO
                          </span>
                        ) : staff.role === 'admin' ? (
                          <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-bold">
                            ADMINISTRADOR
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
                            STAFF
                          </span>
                        )}
                      </td>

                      {/* Discord Link */}
                      <td className="py-3.5 px-4">
                        {staff.discord_username ? (
                          <div className="flex items-center gap-1.5 text-indigo-300 font-mono text-[11px]">
                            <Link className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{staff.discord_username}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#8B949E]/60 italic">
                            No vinculado
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 text-[#8B949E] text-[11px] font-mono">
                        {staff.last_login_at
                          ? new Date(staff.last_login_at).toLocaleString()
                          : 'Nunca'}
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isStaffOwner ? (
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            Permanente
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(staff)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold cursor-pointer transition-all border ${
                              staff.is_active
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                                : 'bg-rose-500/15 border-rose-500/30 text-rose-300 hover:bg-rose-500/25'
                            }`}
                          >
                            {staff.is_active ? 'Activo' : 'Suspendido'}
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setPasswordModalTarget(staff);
                              setChangePasswordInput('');
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-semibold text-[11px] inline-flex items-center gap-1.5 cursor-pointer transition-all"
                            title="Cambiar contraseña a tu antojo"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                            <span>Cambiar Contraseña</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Crear Staff */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0D0F14] border border-purple-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Crear Nueva Cuenta de Staff</h3>
                  <span className="text-xs text-[#8B949E]">
                    Asigna el usuario y la contraseña que tú elijas
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-[#8B949E] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                  Usuario de Login (Username)
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="ej. mod_pedro"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                  Nombre para Mostrar (Display Name)
                </label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="ej. Pedro | Moderador"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                  Contraseña Asignada (A tu elección)
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="ej. hispan2026@"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                  Rango / Rol
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole('staff')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      newRole === 'staff'
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                        : 'bg-white/[0.03] border-white/10 text-[#8B949E]'
                    }`}
                  >
                    Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole('admin')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      newRole === 'admin'
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                        : 'bg-white/[0.03] border-white/10 text-[#8B949E]'
                    }`}
                  >
                    Administrador
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#8B949E] hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isCreating ? <span>Creando...</span> : <span>Confirmar y Crear</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Cambiar Contraseña a su Antojo */}
      {passwordModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0D0F14] border border-amber-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cambiar Contraseña</h3>
                  <span className="text-xs text-[#8B949E]">
                    Usuario: <strong className="text-white">{passwordModalTarget.display_name}</strong> (@{passwordModalTarget.username})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalTarget(null)}
                className="p-1 rounded-lg text-[#8B949E] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-1">
                  Nueva Contraseña a Asignar
                </label>
                <input
                  type="text"
                  value={changePasswordInput}
                  onChange={(e) => setChangePasswordInput(e.target.value)}
                  placeholder="Escribe la nueva contraseña..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-500/50"
                  required
                  autoFocus
                />
                <span className="text-[10px] text-[#8B949E] mt-1 block">
                  Se actualizará de forma instantánea mediante hash seguro SHA-256.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setPasswordModalTarget(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#8B949E] hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isChangingPassword ? <span>Guardando...</span> : <span>Actualizar Contraseña</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Crown,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { AppUser, StaffAccount } from '../types';
import { getAppUsers, updateAppUserAccess } from '../services/supabase';

interface UsersManagementTabProps {
  currentStaff: StaffAccount;
}

export const UsersManagementTab: React.FC<UsersManagementTabProps> = ({ currentStaff }) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const isStaff = currentStaff.role === 'staff';
  const isOwner = currentStaff.role === 'owner';

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAppUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showNotification = (text: string, isError = false) => {
    setFeedbackMsg({ text, isError });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3500);
  };

  // Toggle single access permission
  const handleToggleAccess = async (
    user: AppUser,
    field: 'can_use_sanciones' | 'can_use_tweaks' | 'can_use_citizens' | 'can_use_tickets'
  ) => {
    // REGLA: Staff NO puede tocar Optimizador ni Citizens
    if (isStaff && (field === 'can_use_tweaks' || field === 'can_use_citizens')) {
      showNotification('Acceso denegado: El rol Staff solo puede gestionar Sanciones y Conteo de Tickets.', true);
      return;
    }

    if (user.is_admin && user[field] && !isOwner) {
      showNotification('¡Acción denegada! No puedes revocarle permisos al Dueño / Administrador.', true);
      return;
    }

    const nextValue = !user[field];
    setActionLoadingId(`${user.id}-${field}`);
    try {
      await updateAppUserAccess(user.id, field, nextValue, currentStaff);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, [field]: nextValue } : u))
      );
      const label =
        field === 'can_use_sanciones'
          ? 'Sanciones'
          : field === 'can_use_tickets'
          ? 'Conteo de Tickets'
          : field === 'can_use_tweaks'
          ? 'Optimizador'
          : 'Citizens';
      showNotification(`Permiso de ${label} ${nextValue ? 'activado' : 'desactivado'} para ${user.discord_username}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar permiso.';
      showNotification(msg, true);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 1-Click Master Access: Give or Revoke Access
  const handleMasterAccess = async (user: AppUser, grant: boolean) => {
    if (user.is_admin && !grant && !isOwner) {
      showNotification('¡Acción denegada! Nadie puede revocarle accesos al Dueño.', true);
      return;
    }

    setActionLoadingId(`${user.id}-all`);
    try {
      await updateAppUserAccess(user.id, 'all', grant, currentStaff);
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== user.id) return u;
          if (isStaff) {
            // El staff solo conmuta Sanciones y Tickets
            return {
              ...u,
              can_use_sanciones: grant,
              can_use_tickets: grant,
            };
          }
          // El Dueño conmuta todos los módulos
          return {
            ...u,
            can_use_sanciones: grant,
            can_use_tweaks: grant,
            can_use_citizens: grant,
            can_use_tickets: grant,
          };
        })
      );
      showNotification(
        grant
          ? `Acceso ${isStaff ? 'a Sanciones y Tickets' : 'Total'} CONCEDIDO a ${user.discord_username}`
          : `Acceso ${isStaff ? 'a Sanciones y Tickets' : 'Total'} BLOQUEADO para ${user.discord_username}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar accesos.';
      showNotification(msg, true);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered users (SIN buscar ni exponer IP)
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      u.discord_username.toLowerCase().includes(query) ||
      u.discord_id.toLowerCase().includes(query) ||
      (u.hwid && u.hwid.toLowerCase().includes(query))
    );
  });

  const totalUsersCount = users.length;
  const activeSancionesCount = users.filter((u) => u.can_use_sanciones).length;
  const activeTicketsCount = users.filter((u) => u.can_use_tickets).length;

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
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
              Total Usuarios Registrados
            </span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{totalUsersCount}</div>
          <span className="text-[11px] text-[#8B949E]">Cuentas en la base de datos</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
              Acceso a Sanciones
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{activeSancionesCount}</div>
          <span className="text-[11px] text-[#8B949E]">
            {activeTicketsCount} usuarios con Conteo de Tickets
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">
              Nivel de Autorización
            </span>
            {isOwner ? <Crown className="w-4 h-4 text-amber-400" /> : <Lock className="w-4 h-4 text-cyan-400" />}
          </div>
          <div className="text-xs font-bold text-white/90 mt-2">
            {isOwner ? 'Dueño / SuperAdmin' : 'Staff Autorizado'}
          </div>
          <span className="text-[11px] text-[#8B949E]">
            {isStaff
              ? 'Control exclusivo sobre Sanciones y Tickets'
              : 'Acceso total a todos los módulos y ajustes'}
          </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por usuario, Discord ID o HWID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-[#8B949E]/50 text-xs focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0D0F14]/80 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[#8B949E] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Usuario Discord</th>
                <th className="py-3.5 px-4">HWID / Hardware</th>
                <th className="py-3.5 px-4 text-center">Acción Rápida</th>
                <th className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1 text-emerald-400">
                    <span>Sanciones</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1 text-emerald-400">
                    <span>Tickets</span>
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1">
                    <span>Optimizador</span>
                    {isStaff && (
                      <span title="Bloqueado para Staff">
                        <Lock className="w-3 h-3 text-[#8B949E]" />
                      </span>
                    )}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">
                  <div className="inline-flex items-center gap-1">
                    <span>Citizens</span>
                    {isStaff && (
                      <span title="Bloqueado para Staff">
                        <Lock className="w-3 h-3 text-[#8B949E]" />
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8B949E]">
                    <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto mb-2" />
                    Cargando usuarios de la base de datos...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8B949E]">
                    No se encontraron usuarios registrados coincidentes.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isUserOwner = user.is_admin;
                  const hasStaffAuthorizedAll = user.can_use_sanciones && user.can_use_tickets;
                  const hasAll =
                    user.can_use_sanciones &&
                    user.can_use_tweaks &&
                    user.can_use_citizens &&
                    user.can_use_tickets;
                  const isActionLoading = actionLoadingId?.startsWith(user.id);

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isUserOwner ? 'bg-amber-500/[0.03]' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {user.discord_avatar ? (
                              <img
                                src={user.discord_avatar}
                                alt={user.discord_username}
                                className="w-9 h-9 rounded-xl border border-white/10 object-cover"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xs">
                                {user.discord_username.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            {isUserOwner && (
                              <span
                                className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-amber-500 text-black shadow-md"
                                title="Dueño / Admin Principal"
                              >
                                <Crown className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white">
                                {user.discord_username}
                              </span>
                              {isUserOwner && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono">
                                  DUEÑO
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-[#8B949E] block">
                              ID: {user.discord_id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Hardware Info (IP COMPLETAMENTE OCULTA Y ELIMINADA) */}
                      <td className="py-3.5 px-4 text-[#8B949E]">
                        <div className="space-y-0.5 font-mono text-[10px]">
                          <div className="text-white/80 truncate max-w-[170px]" title={user.hwid || 'Sin HWID'}>
                            HWID: {user.hwid ? user.hwid.slice(0, 16) + '...' : 'Vinculado'}
                          </div>
                          <div className="text-[#8B949E]/70 truncate max-w-[170px]">
                            {user.os_info || 'Windows'}
                          </div>
                        </div>
                      </td>

                      {/* 1-Click Master Access Button (Adaptado a permisos de Staff o Dueño) */}
                      <td className="py-3.5 px-4 text-center">
                        {isUserOwner ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                            <Lock className="w-3 h-3" /> Intocable
                          </span>
                        ) : isStaff ? (
                          hasStaffAuthorizedAll ? (
                            <button
                              onClick={() => handleMasterAccess(user, false)}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                              title="Bloquear Sanciones y Tickets"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Bloquear Sanc./Tick.</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMasterAccess(user, true)}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                              title="Permitir Sanciones y Tickets"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Permitir Sanc./Tick.</span>
                            </button>
                          )
                        ) : hasAll ? (
                          <button
                            onClick={() => handleMasterAccess(user, false)}
                            disabled={isActionLoading}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                            title="Bloquear todos los módulos de golpe"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Bloquear Todo</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMasterAccess(user, true)}
                            disabled={isActionLoading}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                            title="Dar acceso a todos los módulos con un solo clic"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Dar Acceso Total</span>
                          </button>
                        )}
                      </td>

                      {/* Switch Sanciones (PERMITIDO A STAFF Y DUEÑO) */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleAccess(user, 'can_use_sanciones')}
                          disabled={isActionLoading || (isUserOwner && user.can_use_sanciones)}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer disabled:cursor-not-allowed ${
                            user.can_use_sanciones
                              ? 'bg-emerald-500'
                              : 'bg-white/10 hover:bg-white/20'
                          } ${isUserOwner ? 'opacity-80' : ''}`}
                          title={
                            isUserOwner
                              ? 'Protegido por el sistema'
                              : user.can_use_sanciones
                              ? 'Sanciones habilitadas (Click para bloquear)'
                              : 'Sanciones bloqueadas (Click para habilitar)'
                          }
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                              user.can_use_sanciones ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Switch Tickets (PERMITIDO A STAFF Y DUEÑO) */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleAccess(user, 'can_use_tickets')}
                          disabled={isActionLoading || (isUserOwner && user.can_use_tickets)}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer disabled:cursor-not-allowed ${
                            user.can_use_tickets
                              ? 'bg-emerald-500'
                              : 'bg-white/10 hover:bg-white/20'
                          } ${isUserOwner ? 'opacity-80' : ''}`}
                          title={
                            isUserOwner
                              ? 'Protegido por el sistema'
                              : user.can_use_tickets
                              ? 'Conteo de tickets habilitado (Click para bloquear)'
                              : 'Conteo de tickets bloqueado (Click para habilitar)'
                          }
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                              user.can_use_tickets ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Switch Tweaks / Optimizador (BLOQUEADO PARA STAFF) */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleAccess(user, 'can_use_tweaks')}
                          disabled={isStaff || isActionLoading || (isUserOwner && user.can_use_tweaks)}
                          className={`w-9 h-5 rounded-full transition-colors relative ${
                            isStaff
                              ? 'opacity-40 cursor-not-allowed'
                              : 'cursor-pointer'
                          } ${
                            user.can_use_tweaks
                              ? 'bg-emerald-500'
                              : 'bg-white/10 hover:bg-white/20'
                          } ${isUserOwner ? 'opacity-80' : ''}`}
                          title={
                            isStaff
                              ? 'Acceso bloqueado: Solo el Dueño puede modificar el Optimizador'
                              : isUserOwner
                              ? 'Protegido por el sistema'
                              : user.can_use_tweaks
                              ? 'Optimizador habilitado'
                              : 'Optimizador bloqueado'
                          }
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                              user.can_use_tweaks ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Switch Citizens (BLOQUEADO PARA STAFF) */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleAccess(user, 'can_use_citizens')}
                          disabled={isStaff || isActionLoading || (isUserOwner && user.can_use_citizens)}
                          className={`w-9 h-5 rounded-full transition-colors relative ${
                            isStaff
                              ? 'opacity-40 cursor-not-allowed'
                              : 'cursor-pointer'
                          } ${
                            user.can_use_citizens
                              ? 'bg-emerald-500'
                              : 'bg-white/10 hover:bg-white/20'
                          } ${isUserOwner ? 'opacity-80' : ''}`}
                          title={
                            isStaff
                              ? 'Acceso bloqueado: Solo el Dueño puede modificar Citizens'
                              : isUserOwner
                              ? 'Protegido por el sistema'
                              : user.can_use_citizens
                              ? 'Citizens habilitado'
                              : 'Citizens bloqueado'
                          }
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                              user.can_use_citizens ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

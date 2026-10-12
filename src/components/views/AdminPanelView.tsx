import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  Users,
  Cpu,
  Shield,
  CheckCircle2,
  Copy,
  Monitor,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchAllUsers, updateUserPermissions, AppUserRecord, supabase } from '../../services/supabase';

export const AdminPanelView: React.FC = () => {
  const { userRecord, refreshUserRecord } = useAuth();
  const [users, setUsers] = useState<AppUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedHwidUser, setExpandedHwidUser] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Cargar usuarios de Supabase
  const loadUsers = async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('[AdminPanel] Error al cargar lista de usuarios:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();

    // Suscripción Realtime en el panel admin para ver altas, cambios y logins en directo
    const channel = supabase
      .channel('admin_panel_users_live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_users',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            const updated = payload.new as AppUserRecord;
            setUsers((prev) =>
              prev.map((u) => (u.discord_id === updated.discord_id ? { ...u, ...updated } : u))
            );
          } else if (payload.eventType === 'INSERT' && payload.new) {
            const inserted = payload.new as AppUserRecord;
            setUsers((prev) => {
              if (prev.some((u) => u.discord_id === inserted.discord_id)) return prev;
              return [inserted, ...prev];
            });
          } else if (payload.eventType === 'DELETE' && payload.old) {
            const deleted = payload.old as AppUserRecord;
            setUsers((prev) => prev.filter((u) => u.discord_id !== deleted.discord_id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTogglePermission = async (
    targetUser: AppUserRecord,
    permissionKey: 'can_use_tweaks' | 'can_use_sanciones'
  ) => {
    const currentVal = targetUser[permissionKey] ?? true;
    const newVal = !currentVal;
    setUpdatingId(targetUser.discord_id);

    // Actualización optimista inmediata en interfaz
    setUsers((prev) =>
      prev.map((u) =>
        u.discord_id === targetUser.discord_id ? { ...u, [permissionKey]: newVal } : u
      )
    );

    try {
      const updated = await updateUserPermissions(targetUser.discord_id, {
        [permissionKey]: newVal,
      });

      // Confirmar con el registro exacto devuelto por Supabase
      setUsers((prev) =>
        prev.map((u) => (u.discord_id === targetUser.discord_id ? updated : u))
      );

      const permName = permissionKey === 'can_use_tweaks' ? 'Optimizaciones' : 'Sanciones';
      setActionSuccessMsg(
        `Permiso de ${permName} ${newVal ? 'habilitado' : 'deshabilitado'} para ${targetUser.discord_username}`
      );
      setTimeout(() => setActionSuccessMsg(null), 3000);

      // Si nos modificamos a nosotros mismos, refrescar estado local
      if (userRecord && userRecord.discord_id === targetUser.discord_id) {
        refreshUserRecord();
      }
    } catch (err) {
      console.error('[AdminPanel] Error al cambiar permiso:', err);
      // Revertir en caso de fallo
      setUsers((prev) =>
        prev.map((u) =>
          u.discord_id === targetUser.discord_id ? { ...u, [permissionKey]: currentVal } : u
        )
      );
      setActionSuccessMsg(`Error al actualizar permiso.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtrar usuarios
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.discord_username.toLowerCase().includes(q) ||
        u.discord_id.includes(q) ||
        (u.ip_address && u.ip_address.toLowerCase().includes(q)) ||
        (u.hwid && u.hwid.toLowerCase().includes(q))
    );
  }, [users, searchQuery]);

  // Contadores
  const stats = useMemo(() => {
    const total = users.length;
    const tweaksActive = users.filter((u) => u.can_use_tweaks !== false).length;
    const sancionesActive = users.filter((u) => u.can_use_sanciones !== false).length;
    const admins = users.filter((u) => u.is_admin === true).length;
    return { total, tweaksActive, sancionesActive, admins };
  }, [users]);

  // Seguridad: si el usuario no es admin
  if (!userRecord?.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Acceso Restringido</h2>
        <p className="text-sm text-[#9CA3AF] max-w-md">
          Este panel está reservado exclusivamente para los administradores de <strong>g0d suite</strong>.
          Si requieres permisos elevados, comunícate con la dirección.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6 select-none bg-[#0a0c0f]">
      {/* Toast de confirmación flotante */}
      <AnimatePresence>
        {actionSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-12 right-8 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-emerald-500/30 text-emerald-300 text-xs shadow-2xl backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Panel de Administración
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                ROOT PRIVILEGES
              </span>
            </h1>
            <p className="text-xs text-[#8B949E]">
              Control granular de permisos, hardware y auditoría de cuentas registradas en Supabase
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadUsers}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 text-xs text-[#9CA3AF] hover:text-white border border-white/[0.08] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
          <div className="flex items-center justify-between text-[#8B949E] text-xs mb-1">
            <span>Usuarios Totales</span>
            <Users className="w-4 h-4 text-white/70" />
          </div>
          <div className="text-xl font-bold font-mono text-white">{stats.total}</div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
          <div className="flex items-center justify-between text-[#8B949E] text-xs mb-1">
            <span>Permiso Tweaks</span>
            <Cpu className="w-4 h-4 text-cyan-400/80" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300">
            {stats.tweaksActive} <span className="text-xs text-[#717680] font-sans">/ {stats.total}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
          <div className="flex items-center justify-between text-[#8B949E] text-xs mb-1">
            <span>Permiso Sanciones</span>
            <Shield className="w-4 h-4 text-emerald-400/80" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            {stats.sancionesActive} <span className="text-xs text-[#717680] font-sans">/ {stats.total}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
          <div className="flex items-center justify-between text-[#8B949E] text-xs mb-1">
            <span>Administradores</span>
            <ShieldCheck className="w-4 h-4 text-amber-400/80" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">{stats.admins}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717680]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por usuario de Discord, Discord ID, HWID o dirección IP..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-white/20 text-xs text-white placeholder-[#717680] outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#717680] hover:text-white cursor-pointer"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#717680] flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-white/50" />
            <span>Consultando registros de usuarios en Supabase...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#717680] rounded-xl border border-white/[0.06] bg-white/[0.01]">
            No se han encontrado usuarios coincidentes con "{searchQuery}".
          </div>
        ) : (
          filteredUsers.map((u) => {
            const hasTweaks = u.can_use_tweaks !== false;
            const hasSanciones = u.can_use_sanciones !== false;
            const isSelf = userRecord.discord_id === u.discord_id;
            const isUpdating = updatingId === u.discord_id;
            const isHwidExpanded = expandedHwidUser === u.discord_id;

            return (
              <motion.div
                key={u.discord_id}
                layout
                className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.035] border border-white/[0.08] transition-all space-y-3"
              >
                {/* Top row: User Identity & Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={u.discord_avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                      alt={u.discord_username}
                      className="w-10 h-10 rounded-full object-cover border border-white/10 bg-black/40 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://cdn.discordapp.com/embed/avatars/0.png';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate">
                          {u.discord_username}
                        </span>
                        {u.is_admin ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ADMIN
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#8B949E] bg-white/[0.04] border border-white/[0.08]">
                            USUARIO
                          </span>
                        )}
                        {isSelf && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                            TÚ
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#8B949E] mt-0.5 font-mono">
                        <span>ID: {u.discord_id}</span>
                        <button
                          onClick={() => handleCopy(u.discord_id, `id_${u.discord_id}`)}
                          className="hover:text-white cursor-pointer"
                          title="Copiar Discord ID"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {copiedId === `id_${u.discord_id}` && (
                          <span className="text-emerald-400 text-[10px]">Copiado</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions / Toggles */}
                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                    {/* Toggle Optimizaciones / Tweaks */}
                    <div className="flex items-center gap-2 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.06]">
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-[#8B949E] font-medium">Optimizaciones</span>
                        <span
                          className={`text-[11px] font-semibold ${
                            hasTweaks ? 'text-cyan-300' : 'text-rose-400'
                          }`}
                        >
                          {hasTweaks ? 'Habilitado' : 'Bloqueado'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleTogglePermission(u, 'can_use_tweaks')}
                        disabled={isUpdating}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                          hasTweaks ? 'bg-cyan-600' : 'bg-zinc-800 border border-white/10'
                        }`}
                        title={
                          hasTweaks
                            ? 'Clic para denegar acceso a Tweaks'
                            : 'Clic para autorizar acceso a Tweaks'
                        }
                      >
                        <motion.div
                          layout
                          className={`w-4 h-4 rounded-full bg-white shadow-sm ${
                            hasTweaks ? 'ml-auto' : 'mr-auto'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Toggle HispanLife Sanciones */}
                    <div className="flex items-center gap-2 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.06]">
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-[#8B949E] font-medium">Sanciones</span>
                        <span
                          className={`text-[11px] font-semibold ${
                            hasSanciones ? 'text-emerald-300' : 'text-rose-400'
                          }`}
                        >
                          {hasSanciones ? 'Habilitado' : 'Bloqueado'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleTogglePermission(u, 'can_use_sanciones')}
                        disabled={isUpdating}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                          hasSanciones ? 'bg-emerald-600' : 'bg-zinc-800 border border-white/10'
                        }`}
                        title={
                          hasSanciones
                            ? 'Clic para denegar acceso a Sanciones HispanLife'
                            : 'Clic para autorizar acceso a Sanciones HispanLife'
                        }
                      >
                        <motion.div
                          layout
                          className={`w-4 h-4 rounded-full bg-white shadow-sm ${
                            hasSanciones ? 'ml-auto' : 'mr-auto'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: IP & Hardware Telemetry Snippet */}
                <div className="pt-2 border-t border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#8B949E] gap-2">
                  <div className="flex items-center gap-4 flex-wrap font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      IP: <strong className="text-white/80">{u.ip_address || '127.0.0.1'}</strong>
                    </span>

                    <span className="truncate max-w-[260px]" title={u.hwid || 'N/A'}>
                      HWID: <strong className="text-white/80">{u.hwid ? `${u.hwid.slice(0, 16)}...` : 'N/A'}</strong>
                    </span>

                    {u.last_login_at && (
                      <span className="text-[#717680]">
                        Último acceso: {new Date(u.last_login_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setExpandedHwidUser(isHwidExpanded ? null : u.discord_id)
                    }
                    className="flex items-center gap-1 text-[11px] text-white/70 hover:text-white cursor-pointer ml-auto sm:ml-0"
                  >
                    <Monitor className="w-3.5 h-3.5 text-white/60" />
                    <span>{isHwidExpanded ? 'Ocultar Hardware' : 'Ver Detalles Hardware'}</span>
                  </button>
                </div>

                {/* Expanded Hardware Telemetry Drawer */}
                <AnimatePresence>
                  {isHwidExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 text-xs overflow-hidden"
                    >
                      <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                        <div>
                          <span className="text-[#717680] block text-[10px]">Procesador (CPU)</span>
                          <span className="text-white font-mono">{u.cpu_info || 'No reportado'}</span>
                        </div>
                        <div>
                          <span className="text-[#717680] block text-[10px]">Gráfica (GPU)</span>
                          <span className="text-white font-mono">{u.gpu_info || 'No reportado'}</span>
                        </div>
                        <div>
                          <span className="text-[#717680] block text-[10px]">Memoria RAM</span>
                          <span className="text-white font-mono">{u.ram_info || 'No reportado'}</span>
                        </div>
                        <div>
                          <span className="text-[#717680] block text-[10px]">Sistema Operativo</span>
                          <span className="text-white font-mono">{u.os_info || 'Windows'}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

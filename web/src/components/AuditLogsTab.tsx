import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Search,
  RefreshCw,
  User,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  XCircle,
  Link,
  LogIn,
  Clock,
  Shield,
} from 'lucide-react';
import { StaffAccount, StaffAuditLog } from '../types';
import { getAuditLogs } from '../services/supabase';

interface AuditLogsTabProps {
  currentStaff: StaffAccount;
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({ currentStaff }) => {
  const [logs, setLogs] = useState<StaffAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isStaff = currentStaff.role === 'staff';

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getAuditLogs(currentStaff);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentStaff]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'grant_access':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ACCESO CONCEDIDO
          </span>
        );
      case 'revoke_access':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-[10px] font-bold inline-flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-400" /> ACCESO BLOQUEADO
          </span>
        );
      case 'create_staff':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-bold inline-flex items-center gap-1">
            <User className="w-3 h-3 text-purple-400" /> STAFF CREADO
          </span>
        );
      case 'change_password':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold inline-flex items-center gap-1">
            <KeyRound className="w-3 h-3 text-amber-400" /> CONTRASEÑA CAMBIADA
          </span>
        );
      case 'login':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-mono text-[10px] font-bold inline-flex items-center gap-1">
            <LogIn className="w-3 h-3 text-blue-400" /> INICIO SESIÓN
          </span>
        );
      case 'link_discord':
        return (
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-[10px] font-bold inline-flex items-center gap-1">
            <Link className="w-3 h-3 text-indigo-400" /> DISCORD VINCULADO
          </span>
        );
      case 'disable_staff':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-[10px] font-bold inline-flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" /> STAFF SUSPENDIDO
          </span>
        );
      case 'enable_staff':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> STAFF REACTIVADO
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px] font-bold">
            {action.toUpperCase()}
          </span>
        );
    }
  };

  const filteredLogs = logs.filter((log) => {
    // Si es staff, asegurar estrictamente que solo se ven eventos de Sanciones y Tickets
    if (isStaff) {
      const details = (log.details || '').toLowerCase();
      const action = (log.action || '').toLowerCase();
      const isSancionOrTicket =
        details.includes('sancion') ||
        details.includes('ticket') ||
        action.includes('sancion') ||
        action.includes('ticket');
      if (!isSancionOrTicket) return false;
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      log.operator_username.toLowerCase().includes(q) ||
      (log.target_user && log.target_user.toLowerCase().includes(q)) ||
      log.action.toLowerCase().includes(q) ||
      (log.details && log.details.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              {isStaff
                ? 'Auditoría de Sanciones & Conteo de Tickets'
                : 'Registro Global de Auditoría & Logs de Staff'}
            </h2>
          </div>
          <p className="text-xs text-[#8B949E] mt-1">
            {isStaff
              ? 'Historial de modificaciones de acceso relativas a Sanciones HispanLife y Conteo de Tickets.'
              : 'Historial inmutable de todas las acciones operativas realizadas por la administración y el staff.'}
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span>{filteredLogs.length} Eventos Mostrados</span>
        </div>
      </div>

      {/* Search & Refresh */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B949E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por operador, usuario o acción..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-[#8B949E]/50 text-xs focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refrescar Registros</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0D0F14]/80 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[#8B949E] uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Fecha y Hora</th>
                <th className="py-3.5 px-4">Operador</th>
                <th className="py-3.5 px-4">Tipo de Acción</th>
                <th className="py-3.5 px-4">Objetivo / Afectado</th>
                <th className="py-3.5 px-4">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#8B949E]">
                    <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-2" />
                    Cargando auditoría...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#8B949E]">
                    No se encontraron registros de auditoría de Sanciones o Tickets.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 text-[#8B949E] font-mono whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-white/80">
                        <Clock className="w-3.5 h-3.5 text-[#8B949E]" />
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 font-mono text-[11px]">
                        @{log.operator_username}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="py-3.5 px-4 text-white font-mono text-[11px] whitespace-nowrap">
                      {log.target_user ? (
                        <span className="text-white/90">@{log.target_user}</span>
                      ) : (
                        <span className="text-[#8B949E]">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#8B949E] text-xs">
                      {log.details || 'Sin detalles adicionales'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import { supabase } from './supabase';
import {
  StaffRankItem,
  StaffMemberItem,
  SyncedRosterConfig,
  ActiveTicketSessionRecord,
  SyncedCountSessionRecord,
} from '../types';

export const SESSION_HEARTBEAT_INTERVAL_MS = 15000; // 15s
export const SESSION_STALE_THRESHOLD_MS = 120000; // 2 min

/**
 * Obtiene la configuración compartida de rangos y miembros de staff desde Supabase.
 */
export async function fetchSyncedRoster(): Promise<SyncedRosterConfig | null> {
  try {
    const { data, error } = await supabase
      .from('ticket_roster_config')
      .select('*')
      .eq('id', 'current')
      .maybeSingle();

    if (error) {
      console.warn('[TicketSessionService] Error fetching roster config:', error.message);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      ranks: (data.ranks as StaffRankItem[]) || [],
      members: (data.members as StaffMemberItem[]) || [],
      updated_at: data.updated_at,
      updated_by: data.updated_by,
    };
  } catch (err) {
    console.warn('[TicketSessionService] Network error fetching roster:', err);
    return null;
  }
}

/**
 * Guarda y sincroniza la lista de rangos y miembros en tiempo real con Supabase.
 */
export async function saveSyncedRoster(
  ranks: StaffRankItem[],
  members: StaffMemberItem[],
  updatedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Normalizamos los conteos a 0 al guardar la plantilla base del roster si es necesario,
    // o guardamos el snapshot con la estructura actual de rangos y miembros.
    const cleanMembers = members.map((m) => ({
      id: m.id,
      name: m.name,
      rank_id: m.rank_id,
      count: m.count ?? 0,
    }));

    const payload = {
      id: 'current',
      ranks,
      members: cleanMembers,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy || 'Staff',
    };

    const { error } = await supabase
      .from('ticket_roster_config')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('[TicketSessionService] Error saving roster:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[TicketSessionService] Failed to save roster:', err);
    return { success: false, error: err?.message || 'Error de conexión' };
  }
}

/**
 * Obtiene el estado actual de la sesión de conteo activa.
 */
export async function fetchActiveTicketSession(): Promise<ActiveTicketSessionRecord | null> {
  try {
    const { data, error } = await supabase
      .from('active_ticket_session')
      .select('*')
      .eq('id', 'current')
      .maybeSingle();

    if (error) {
      console.warn('[TicketSessionService] Error fetching active session:', error.message);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      is_active: !!data.is_active,
      operator_id: data.operator_id,
      operator_name: data.operator_name,
      operator_avatar: data.operator_avatar,
      session_code: data.session_code,
      session_date: data.session_date,
      started_at: data.started_at,
      last_heartbeat: data.last_heartbeat,
      current_tickets_count: data.current_tickets_count || 0,
    };
  } catch (err) {
    console.warn('[TicketSessionService] Network error fetching active session:', err);
    return null;
  }
}

/**
 * Inicia una nueva sesión de conteo para el operador actual.
 */
export async function startActiveTicketSession(params: {
  operatorId?: string;
  operatorName: string;
  operatorAvatar?: string | null;
  sessionCode: string;
  sessionDate: string;
  initialCount?: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    const payload = {
      id: 'current',
      is_active: true,
      operator_id: params.operatorId || null,
      operator_name: params.operatorName,
      operator_avatar: params.operatorAvatar || null,
      session_code: params.sessionCode,
      session_date: params.sessionDate,
      started_at: now,
      last_heartbeat: now,
      current_tickets_count: params.initialCount || 0,
    };

    const { error } = await supabase
      .from('active_ticket_session')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('[TicketSessionService] Error starting session:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[TicketSessionService] Failed to start session:', err);
    return { success: false, error: err?.message || 'Error de conexión' };
  }
}

/**
 * Envía un latido (heartbeat) para mantener viva la sesión e informar del conteo acumulado.
 */
export async function heartbeatActiveTicketSession(
  currentTicketsCount: number
): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from('active_ticket_session')
      .update({
        last_heartbeat: new Date().toISOString(),
        current_tickets_count: currentTicketsCount,
      })
      .eq('id', 'current')
      .eq('is_active', true);

    if (error) {
      console.warn('[TicketSessionService] Error heartbeating session:', error.message);
      return { success: false };
    }
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Libera o cancela la sesión activa actual.
 */
export async function releaseActiveTicketSession(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('active_ticket_session')
      .update({
        is_active: false,
        last_heartbeat: new Date().toISOString(),
      })
      .eq('id', 'current');

    if (error) {
      console.error('[TicketSessionService] Error releasing session:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al liberar sesión' };
  }
}

/**
 * Finaliza la sesión actual: guarda el registro en el historial de Supabase y desactiva la sesión.
 */
export async function finishAndArchiveTicketSession(params: {
  sessionCode: string;
  sessionDate: string;
  operatorName: string;
  operatorId?: string;
  totalTickets: number;
  activeStaffs: number;
  countsSnapshot: StaffMemberItem[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const historyPayload = {
      id: sessionId,
      session_code: params.sessionCode,
      session_date: params.sessionDate,
      operator_name: params.operatorName,
      operator_id: params.operatorId || null,
      total_tickets: params.totalTickets,
      active_staffs: params.activeStaffs,
      counts_snapshot: params.countsSnapshot,
      created_at: new Date().toISOString(),
    };

    // 1. Guardar en histórico
    const { error: historyErr } = await supabase
      .from('ticket_count_sessions')
      .insert(historyPayload);

    if (historyErr) {
      console.error('[TicketSessionService] Error archiving session:', historyErr.message);
      return { success: false, error: historyErr.message };
    }

    // 2. Liberar la sesión activa
    await releaseActiveTicketSession();

    return { success: true };
  } catch (err: any) {
    console.error('[TicketSessionService] Exception finishing session:', err);
    return { success: false, error: err?.message || 'Error al finalizar sesión' };
  }
}

/**
 * Obtiene el historial remoto de sesiones finalizadas de Supabase.
 */
export async function fetchSyncedCountSessions(
  limit: number = 50
): Promise<SyncedCountSessionRecord[]> {
  try {
    const { data, error } = await supabase
      .from('ticket_count_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[TicketSessionService] Error fetching history:', error.message);
      return [];
    }

    return (data as SyncedCountSessionRecord[]) || [];
  } catch (err) {
    console.warn('[TicketSessionService] Exception fetching history:', err);
    return [];
  }
}

/**
 * Determina si una sesión está estancada/abandonada basándose en la última señal de vida (heartbeat).
 */
export function isSessionStale(lastHeartbeat?: string | null): boolean {
  if (!lastHeartbeat) return true;
  const last = new Date(lastHeartbeat).getTime();
  const now = Date.now();
  return now - last > SESSION_STALE_THRESHOLD_MS;
}

/**
 * Suscripción en tiempo real con Supabase Realtime para cambios en rangos y sesiones.
 */
export function subscribeTicketLiveSync(callbacks: {
  onRosterChange?: (roster: SyncedRosterConfig) => void;
  onActiveSessionChange?: (session: ActiveTicketSessionRecord) => void;
  onNewHistorySession?: (session: SyncedCountSessionRecord) => void;
}): () => void {
  const channelName = `ticket-live-sync-${Date.now()}`;
  const channel = supabase.channel(channelName);

  channel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ticket_roster_config',
      },
      (payload) => {
        if (payload.new && callbacks.onRosterChange) {
          const newRow = payload.new as any;
          callbacks.onRosterChange({
            id: newRow.id,
            ranks: newRow.ranks || [],
            members: newRow.members || [],
            updated_at: newRow.updated_at,
            updated_by: newRow.updated_by,
          });
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'active_ticket_session',
      },
      (payload) => {
        if (payload.new && callbacks.onActiveSessionChange) {
          const newRow = payload.new as any;
          callbacks.onActiveSessionChange({
            id: newRow.id,
            is_active: !!newRow.is_active,
            operator_id: newRow.operator_id,
            operator_name: newRow.operator_name,
            operator_avatar: newRow.operator_avatar,
            session_code: newRow.session_code,
            session_date: newRow.session_date,
            started_at: newRow.started_at,
            last_heartbeat: newRow.last_heartbeat,
            current_tickets_count: newRow.current_tickets_count || 0,
          });
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ticket_count_sessions',
      },
      (payload) => {
        if (payload.new && callbacks.onNewHistorySession) {
          callbacks.onNewHistorySession(payload.new as SyncedCountSessionRecord);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

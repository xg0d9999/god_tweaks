import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket,
  Plus,
  Minus,
  Copy,
  RotateCcw,
  UserPlus,
  GripVertical,
  Search,
  Award,
  Shield,
  Check,
  Trash2,
  History,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  Sun,
  Sunset,
  Moon,
  ScrollText,
  ArrowRightLeft,
  User,
  Play,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { ActionButton } from '../ui/ActionButton';
import { useAuth } from '../../context/AuthContext';
import { logTicketAction } from '../../services/discordLogger';
import {
  StaffRankItem,
  StaffMemberItem,
  ManualTicketSession,
  TicketActivityLog,
  TicketActivityType,
  ActiveTicketSessionRecord,
} from '../../types';
import {
  DEFAULT_STAFF_RANKS,
  DEFAULT_STAFF_MEMBERS,
  sortStaffAlphabetically,
  generateDiscordSummary,
  calculateTopPerformers,
  getAutoDetectedShift,
  formatShiftLabel,
} from '../../utils/ticketTemplateFormatter';
import {
  fetchSyncedRoster,
  saveSyncedRoster,
  fetchActiveTicketSession,
  startActiveTicketSession,
  heartbeatActiveTicketSession,
  releaseActiveTicketSession,
  finishAndArchiveTicketSession,
  fetchSyncedCountSessions,
  subscribeTicketLiveSync,
  SESSION_HEARTBEAT_INTERVAL_MS,
} from '../../services/ticketSessionService';

const STORAGE_STAFF_KEY = 'g0d_suite_manual_staff_roster';
const STORAGE_RANKS_KEY = 'g0d_suite_manual_ranks';
const STORAGE_DATE_KEY = 'g0d_suite_manual_date';
const STORAGE_CODE_KEY = 'g0d_suite_manual_code';
const STORAGE_HISTORY_KEY = 'g0d_suite_manual_session_history';
const STORAGE_ACTIVITY_LOGS_KEY = 'g0d_suite_manual_activity_logs';

export const TicketCounterView: React.FC = () => {
  const { user } = useAuth();

  // 1. Estado de Rangos
  const [ranks, setRanks] = useState<StaffRankItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RANKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STAFF_RANKS;
  });

  // 2. Estado de Miembros de Staff (con sus conteos)
  const [members, setMembers] = useState<StaffMemberItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STAFF_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STAFF_MEMBERS;
  });

  // 3. Fecha y Turno del Conteo (ej. xx/xx/xxxx - *MAÑANA / *TARDE / *NOCHE)
  const [sessionDate, setSessionDate] = useState<string>(() => {
    return localStorage.getItem(STORAGE_DATE_KEY) || new Date().toLocaleDateString('es-ES');
  });

  const [sessionCode, setSessionCode] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_CODE_KEY);
    // Si hay un valor guardado y no es el antiguo código numérico aleatorio (ej. 10796)
    if (saved && !/^\d{4,6}$/.test(saved.trim())) {
      return saved;
    }
    return getAutoDetectedShift();
  });

  // 4. Historial de sesiones finalizadas
  const [sessionHistory, setSessionHistory] = useState<ManualTicketSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // 5. Registro de Auditoría y Actividad (Logs de Altas, Bajas, Rangos, etc.)
  const [activityLogs, setActivityLogs] = useState<TicketActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVITY_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [isActivityLogsModalOpen, setIsActivityLogsModalOpen] = useState(false);
  const [logFilterQuery, setLogFilterQuery] = useState('');
  const [logFilterType, setLogFilterType] = useState<string>('all');

  // 6. Ajustes de Top Performers (Automático vs Forzado 1 o 2)
  const [forceSupportCount, setForceSupportCount] = useState<1 | 2 | undefined>(undefined);
  const [forceStaffIgCount, setForceStaffIgCount] = useState<1 | 2 | undefined>(undefined);

  // 7. Buscador y Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterRank, setSelectedFilterRank] = useState<string>('all');
  const [collapsedRanks, setCollapsedRanks] = useState<Record<string, boolean>>({});

  // 8. Modales y Estado de UI
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRank, setNewStaffRank] = useState(DEFAULT_STAFF_RANKS[0].id);

  // 9. Notificaciones de Toast y Copiado
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null);

  // 10. Drag and Drop state (Pointer Events fluidos, 100% inmune a bloqueo de cursor del SO)
  const [draggedMemberId, setDraggedMemberId] = useState<string | null>(null);
  const [draggedMemberData, setDraggedMemberData] = useState<StaffMemberItem | null>(null);
  const [dragOverRankId, setDragOverRankId] = useState<string | null>(null);
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerStartRef = useRef<{ x: number; y: number; member: StaffMemberItem } | null>(null);

  // 11. Sesión Activa de Conteo en Tiempo Real (Supabase Realtime)
  const [activeSession, setActiveSession] = useState<ActiveTicketSessionRecord | null>(null);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isFinishingSession, setIsFinishingSession] = useState(false);

  // Persistencia automática en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_STAFF_KEY, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_RANKS_KEY, JSON.stringify(ranks));
  }, [ranks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_DATE_KEY, sessionDate);
  }, [sessionDate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_CODE_KEY, sessionCode);
  }, [sessionCode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_ACTIVITY_LOGS_KEY, JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Carga inicial y Suscripción en Tiempo Real con Supabase
  useEffect(() => {
    let isMounted = true;

    // A. Cargar lista sincronizada de rangos y miembros desde Supabase
    fetchSyncedRoster().then((remoteRoster) => {
      if (!isMounted) return;
      if (remoteRoster && remoteRoster.ranks && remoteRoster.ranks.length > 0) {
        setRanks(remoteRoster.ranks);
        if (remoteRoster.members && remoteRoster.members.length > 0) {
          setMembers((prevLocal) => {
            const countMap = new Map(prevLocal.map((m) => [m.id, m.count]));
            return remoteRoster.members.map((m) => ({
              ...m,
              count: countMap.get(m.id) ?? m.count ?? 0,
            }));
          });
        }
      } else {
        // Inicializar en la base de datos si está vacía
        saveSyncedRoster(DEFAULT_STAFF_RANKS, DEFAULT_STAFF_MEMBERS, 'Inicialización').catch(() => {});
      }
    });

    // B. Cargar sesión de conteo activa
    fetchActiveTicketSession().then((session) => {
      if (isMounted && session) {
        setActiveSession(session);
      }
    });

    // C. Cargar historial remoto
    fetchSyncedCountSessions().then((history) => {
      if (!isMounted || !history || history.length === 0) return;
      setSessionHistory((prev) => {
        const remoteIds = new Set(history.map((h) => h.id));
        const filtered = prev.filter((p) => !remoteIds.has(p.id));
        const mapped: ManualTicketSession[] = history.map((h) => ({
          id: h.id,
          date: h.session_date,
          code: h.session_code,
          total_tickets: h.total_tickets,
          staff_members: h.counts_snapshot || [],
          created_at: new Date(h.created_at).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));
        return [...mapped, ...filtered].slice(0, 50);
      });
    });

    // D. Suscribirse a eventos de Supabase Realtime
    const unsubscribe = subscribeTicketLiveSync({
      onRosterChange: (newRoster) => {
        if (!isMounted) return;
        if (newRoster.ranks && newRoster.ranks.length > 0) {
          setRanks(newRoster.ranks);
        }
        if (newRoster.members && newRoster.members.length > 0) {
          setMembers((prevLocal) => {
            const countMap = new Map(prevLocal.map((m) => [m.id, m.count]));
            return newRoster.members.map((m) => ({
              ...m,
              count: countMap.get(m.id) ?? m.count ?? 0,
            }));
          });
        }
        setToastMessage({
          title: 'Rangos Sincronizados',
          message: `Configuración actualizada por ${newRoster.updated_by || 'Staff'}.`,
        });
      },
      onActiveSessionChange: (session) => {
        if (!isMounted) return;
        setActiveSession(session);
      },
      onNewHistorySession: (historyRow) => {
        if (!isMounted) return;
        const mapped: ManualTicketSession = {
          id: historyRow.id,
          date: historyRow.session_date,
          code: historyRow.session_code,
          total_tickets: historyRow.total_tickets,
          staff_members: historyRow.counts_snapshot || [],
          created_at: new Date(historyRow.created_at).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setSessionHistory((prev) => [mapped, ...prev.filter((p) => p.id !== mapped.id)]);
      },
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Función para registrar eventos de auditoría (local + Discord webhook)
  const recordActivity = (
    type: TicketActivityType,
    title: string,
    details: string,
    extraInfo?: string
  ) => {
    const operator = user?.username || 'Staff Local';
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const dateStr = now.toLocaleDateString('es-ES');
    const newLog: TicketActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      details,
      timestamp: timeStr,
      date: dateStr,
      operator,
    };

    setActivityLogs((prev) => [newLog, ...prev.slice(0, 199)]);

    // Enviar log de auditoría al webhook oficial de Discord en segundo plano
    logTicketAction({
      action: title,
      details,
      user: operator,
      shift: sessionCode,
      extraInfo,
    }).catch(() => {});
  };

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // Sonido de confirmación con Web Audio API
  const playChime = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  // Acciones de suma / resta
  const incrementCount = (memberId: string, amount: number = 1) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, count: Math.max(0, m.count + amount) } : m))
    );
  };

  const decrementCount = (memberId: string, amount: number = 1) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, count: Math.max(0, m.count - amount) } : m))
    );
  };

  const setCountDirectly = (memberId: string, value: number) => {
    const safeVal = isNaN(value) ? 0 : Math.max(0, value);
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, count: safeVal } : m)));
  };

  // Cambio de rango (Ascenso / Descenso)
  const changeMemberRank = (memberId: string, targetRankId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (!member || member.rank_id === targetRankId) return;
    const oldRank = ranks.find((r) => r.id === member.rank_id);
    const targetRank = ranks.find((r) => r.id === targetRankId);

    // Mover y reordenar estrictamente alfabético
    setMembers((prev) => {
      const updated = prev.map((m) =>
        m.id === memberId ? { ...m, rank_id: targetRankId } : m
      );
      const sorted = sortStaffAlphabetically(updated);
      saveSyncedRoster(ranks, sorted, user?.username || 'Staff').catch(() => {});
      return sorted;
    });

    // Desplegar automáticamente la categoría de destino si estuviera colapsada para ver al miembro
    setCollapsedRanks((prev) => ({
      ...prev,
      [targetRankId]: false,
    }));

    playChime();

    recordActivity(
      'change_rank',
      'Cambio de Rango',
      `${member.name}: ${oldRank?.name || member.rank_id} ➔ ${targetRank?.name || targetRankId}`
    );

    setToastMessage({
      title: 'Rango actualizado',
      message: `${member.name} asignado a ${targetRank?.name || targetRankId}`,
    });
  };

  // Expulsar / Eliminar staff
  const removeStaffMember = (memberId: string, name: string) => {
    const member = members.find((m) => m.id === memberId);
    const rank = ranks.find((r) => r.id === member?.rank_id);
    if (confirm(`¿Estás seguro de que deseas eliminar a ${name} de la lista de staffs?`)) {
      setMembers((prev) => {
        const filtered = prev.filter((m) => m.id !== memberId);
        saveSyncedRoster(ranks, filtered, user?.username || 'Staff').catch(() => {});
        return filtered;
      });
      recordActivity(
        'remove_staff',
        'Staff Eliminado',
        `Se ha eliminado a ${name} (${rank?.name || 'Staff'}) del equipo.${
          member?.count ? ` Tenía acumulados ${member.count} tickets.` : ''
        }`
      );
      setToastMessage({
        title: 'Staff eliminado',
        message: `${name} ha sido retirado del conteo.`,
      });
    }
  };

  // Añadir nuevo staff
  const handleAddNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newStaffName.trim();
    if (!cleanName) return;

    const targetRank = ranks.find((r) => r.id === newStaffRank);
    const newId = `staff-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newMember: StaffMemberItem = {
      id: newId,
      name: cleanName,
      rank_id: newStaffRank,
      count: 0,
    };

    const updated = sortStaffAlphabetically([...members, newMember]);
    setMembers(updated);
    saveSyncedRoster(ranks, updated, user?.username || 'Staff').catch(() => {});
    setNewStaffName('');
    setIsAddStaffOpen(false);

    recordActivity(
      'add_staff',
      'Staff Añadido',
      `Se ha incorporado a ${cleanName} al rango ${targetRank?.name || newStaffRank}.`
    );

    setToastMessage({
      title: 'Staff añadido',
      message: `${cleanName} ha sido agregado con éxito.`,
    });
  };

  // Miembro actualmente arrastrado
  const draggedMember = useMemo(() => {
    if (draggedMemberData) return draggedMemberData;
    if (!draggedMemberId) return null;
    return members.find((m) => m.id === draggedMemberId) || null;
  }, [draggedMemberId, draggedMemberData, members]);

  // Iniciar seguimiento de arrastre por puntero (Pointer Events - 100% libre de interferencia del SO)
  const handlePointerDownCard = (e: React.PointerEvent, member: StaffMemberItem) => {
    if (e.button !== 0) return; // Solo botón izquierdo
    const target = e.target as HTMLElement;
    if (target && target.closest && target.closest('button, input, select')) {
      return;
    }

    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      member,
    };
  };

  // Listener global de Pointer Events para arrastre suave y sin bloqueos de cursor
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (!pointerStartRef.current) return;

      const deltaX = Math.abs(e.clientX - pointerStartRef.current.x);
      const deltaY = Math.abs(e.clientY - pointerStartRef.current.y);

      // Activar arrastre solo tras superar umbral de 4px (evita falsos arrastres al hacer click)
      if (!isPointerDragging && (deltaX > 4 || deltaY > 4)) {
        setIsPointerDragging(true);
        const member = pointerStartRef.current.member;
        setDraggedMemberId(member.id);
        setDraggedMemberData(member);
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
      }

      if (isPointerDragging || (deltaX > 4 || deltaY > 4)) {
        setPointerPos({ x: e.clientX, y: e.clientY });

        // Identificar dinámicamente el rango bajo el puntero
        const elemUnder = document.elementFromPoint(e.clientX, e.clientY);
        const rankContainer = elemUnder?.closest('[data-rank-id]');
        const targetRankId = rankContainer?.getAttribute('data-rank-id') || null;

        if (targetRankId !== dragOverRankId) {
          setDragOverRankId(targetRankId);
        }
      }
    };

    const handleGlobalPointerUp = (e: PointerEvent) => {
      if (pointerStartRef.current) {
        const member = pointerStartRef.current.member;
        if (isPointerDragging) {
          const elemUnder = document.elementFromPoint(e.clientX, e.clientY);
          const rankContainer = elemUnder?.closest('[data-rank-id]');
          const targetRankId = rankContainer?.getAttribute('data-rank-id');

          if (targetRankId && targetRankId !== member.rank_id) {
            changeMemberRank(member.id, targetRankId);
          }
        }
      }

      pointerStartRef.current = null;
      setIsPointerDragging(false);
      setDraggedMemberId(null);
      setDraggedMemberData(null);
      setDragOverRankId(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [isPointerDragging, dragOverRankId, members, ranks]);

  // Handlers para eventos HTML5 en contenedores de destino (compatibilidad dual)

  const handleDragEnterRank = (e: React.DragEvent, rankId: string) => {
    e.preventDefault();
    if (dragOverRankId !== rankId) {
      setDragOverRankId(rankId);
    }
  };

  const handleDragOverRank = (e: React.DragEvent, rankId: string) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    if (dragOverRankId !== rankId) {
      setDragOverRankId(rankId);
    }
  };

  const handleDropOnRank = (e: React.DragEvent, rankId: string) => {
    e.preventDefault();
    e.stopPropagation();

    let targetMemberId = draggedMemberId || draggedMemberData?.id;

    if (!targetMemberId && e.dataTransfer) {
      try {
        const json = e.dataTransfer.getData('application/json');
        if (json) {
          const parsed = JSON.parse(json);
          if (parsed?.id) targetMemberId = parsed.id;
        }
      } catch {}
      if (!targetMemberId) {
        targetMemberId = e.dataTransfer.getData('text/plain');
      }
    }

    if (targetMemberId) {
      changeMemberRank(targetMemberId, rankId);
    }

    setDraggedMemberId(null);
    setDraggedMemberData(null);
    setDragOverRankId(null);
  };

  // Reiniciar conteo a 0
  const handleResetCounts = async (saveHistory: boolean) => {
    if (saveHistory && totalTicketsCount > 0) {
      if (isMySession) {
        finishAndArchiveTicketSession({
          sessionCode,
          sessionDate,
          operatorName: user?.username || 'Staff',
          operatorId: user?.id,
          totalTickets: totalTicketsCount,
          activeStaffs: activeStaffCount,
          countsSnapshot: members,
        }).catch(() => {});
      }
      const finishedSession: ManualTicketSession = {
        id: `session-${Date.now()}`,
        date: sessionDate,
        code: sessionCode,
        total_tickets: totalTicketsCount,
        staff_members: [...members],
        created_at: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
      setSessionHistory((prev) => [finishedSession, ...prev.slice(0, 30)]);
    }

    if (isMySession) {
      releaseActiveTicketSession().catch(() => {});
      setActiveSession((prev) => (prev ? { ...prev, is_active: false } : null));
    }

    const previousCount = totalTicketsCount;
    setMembers((prev) => prev.map((m) => ({ ...m, count: 0 })));
    setSessionCode(getAutoDetectedShift());
    setSessionDate(new Date().toLocaleDateString('es-ES'));
    setIsConfirmResetOpen(false);

    recordActivity(
      'reset_counts',
      'Conteo Reiniciado a 0',
      `Todos los contadores volvieron a 0 para el siguiente turno.${
        saveHistory ? ' (Sesión guardada en el historial).' : ''
      }`,
      `Total previo: ${previousCount} tickets`
    );

    setToastMessage({
      title: 'Conteo Reiniciado',
      message: 'Todos los contadores han vuelto a 0 para el siguiente conteo.',
    });
  };

  // Restaurar plantilla por defecto
  const handleRestoreDefaultRoster = () => {
    if (
      confirm(
        '¿Deseas restaurar la lista oficial completa de 49 staffs y rangos por defecto de HispanLifeRP?'
      )
    ) {
      setMembers(DEFAULT_STAFF_MEMBERS);
      setRanks(DEFAULT_STAFF_RANKS);
      saveSyncedRoster(DEFAULT_STAFF_RANKS, DEFAULT_STAFF_MEMBERS, user?.username || 'Staff').catch(() => {});
      recordActivity(
        'restore_roster',
        'Roster Restaurado',
        'Se ha restablecido la lista oficial de 49 staffs y los 12 rangos por defecto.'
      );
      setToastMessage({
        title: 'Lista restaurada en la nube',
        message: 'Roster oficial restablecido y sincronizado con éxito.',
      });
    }
  };

  // Totales y Estadísticas
  const totalTicketsCount = useMemo(() => {
    return members.reduce((acc, m) => acc + m.count, 0);
  }, [members]);

  const activeStaffCount = useMemo(() => {
    return members.filter((m) => m.count > 0).length;
  }, [members]);

  // Detección de sesión activa
  const isMySession = useMemo(() => {
    if (!activeSession?.is_active) return false;
    const myId = user?.id;
    const myName = user?.username;
    if (myId && activeSession.operator_id && activeSession.operator_id === myId) return true;
    if (myName && activeSession.operator_name && activeSession.operator_name.toLowerCase() === myName.toLowerCase()) return true;
    return false;
  }, [activeSession, user]);

  // Heartbeat periódico (cada 15s) cuando el usuario tiene la sesión activa
  useEffect(() => {
    if (!isMySession) return;
    const interval = setInterval(() => {
      heartbeatActiveTicketSession(totalTicketsCount).catch(() => {});
    }, SESSION_HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isMySession, totalTicketsCount]);

  // Acciones de Sesión de Conteo
  const handleStartCountSession = async () => {
    if (activeSession?.is_active && !isMySession) {
      setToastMessage({
        title: 'Sesión en Curso',
        message: `${activeSession.operator_name || 'Otro staff'} está realizando el conteo oficial actualmente.`,
      });
      return;
    }

    setIsStartingSession(true);
    try {
      const res = await startActiveTicketSession({
        operatorId: user?.id,
        operatorName: user?.username || 'Staff',
        operatorAvatar: user?.avatar_url,
        sessionCode,
        sessionDate,
        initialCount: totalTicketsCount,
      });

      if (res.success) {
        setActiveSession({
          id: 'current',
          is_active: true,
          operator_id: user?.id || null,
          operator_name: user?.username || 'Staff',
          operator_avatar: user?.avatar_url || null,
          session_code: sessionCode,
          session_date: sessionDate,
          started_at: new Date().toISOString(),
          last_heartbeat: new Date().toISOString(),
          current_tickets_count: totalTicketsCount,
        });

        playChime();
        recordActivity(
          'change_shift',
          'Sesión de Conteo Iniciada',
          `${user?.username || 'Staff'} ha iniciado sesión de conteo para el turno ${sessionCode}.`,
          `Tickets actuales: ${totalTicketsCount}`
        );

        setToastMessage({
          title: 'Sesión Iniciada',
          message: `Eres el operador activo del turno ${sessionCode}. Todos los usuarios verán tu sesión en curso.`,
        });
      } else {
        setToastMessage({
          title: 'Error al iniciar sesión',
          message: res.error || 'No se pudo contactar con Supabase.',
        });
      }
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleFinishCountSession = async () => {
    setIsFinishingSession(true);
    try {
      const opName = user?.username || activeSession?.operator_name || 'Staff';
      const res = await finishAndArchiveTicketSession({
        sessionCode,
        sessionDate,
        operatorName: opName,
        operatorId: user?.id,
        totalTickets: totalTicketsCount,
        activeStaffs: activeStaffCount,
        countsSnapshot: members,
      });

      if (res.success) {
        const finishedSession: ManualTicketSession = {
          id: `session-${Date.now()}`,
          date: sessionDate,
          code: sessionCode,
          total_tickets: totalTicketsCount,
          staff_members: [...members],
          created_at: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        };
        setSessionHistory((prev) => [finishedSession, ...prev.slice(0, 49)]);

        setMembers((prev) => prev.map((m) => ({ ...m, count: 0 })));
        setSessionCode(getAutoDetectedShift());
        setSessionDate(new Date().toLocaleDateString('es-ES'));

        setActiveSession((prev) => (prev ? { ...prev, is_active: false } : null));

        playChime();
        recordActivity(
          'reset_counts',
          'Sesión Finalizada y Archivada',
          `Sesión de ${opName} completada con ${totalTicketsCount} tickets para el turno ${sessionCode}.`,
          `Historial archivado en Supabase`
        );

        setToastMessage({
          title: 'Sesión Archivada con Éxito',
          message: 'El conteo se ha guardado en la nube y los contadores se han puesto a 0.',
        });
      } else {
        setToastMessage({
          title: 'Error al archivar sesión',
          message: res.error || 'No se pudo guardar la sesión en la nube.',
        });
      }
    } finally {
      setIsFinishingSession(false);
    }
  };

  const handleReleaseCountSession = async () => {
    const res = await releaseActiveTicketSession();
    if (res.success) {
      setActiveSession((prev) => (prev ? { ...prev, is_active: false } : null));
      setToastMessage({
        title: 'Sesión Liberada',
        message: 'La sesión de conteo está ahora disponible para cualquier staff.',
      });
    }
  };

  // Generación en tiempo real del resumen de Discord
  const discordSummaryOutput = useMemo(() => {
    return generateDiscordSummary({
      date: sessionDate,
      code: sessionCode,
      ranks,
      members,
      forceSupportCount,
      forceStaffIgCount,
    });
  }, [sessionDate, sessionCode, ranks, members, forceSupportCount, forceStaffIgCount]);

  // Top performers actuales
  const topPerformers = useMemo(() => {
    return calculateTopPerformers(ranks, members, forceSupportCount, forceStaffIgCount);
  }, [ranks, members, forceSupportCount, forceStaffIgCount]);

  // Copiar al portapapeles
  const handleCopyDiscordSummary = async () => {
    const doCopy = async () => {
      try {
        await navigator.clipboard.writeText(discordSummaryOutput);
      } catch {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = discordSummaryOutput;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    };

    await doCopy();
    playChime();
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2800);

    recordActivity(
      'copy_template',
      'Plantilla Copiada',
      `Plantilla de Discord copiada para el turno ${sessionCode}.`,
      `${totalTicketsCount} tickets totales • ${activeStaffCount} staffs activos`
    );

    setToastMessage({
      title: '¡Copiado con Éxito!',
      message: 'Resumen listo para pegar en el canal de Discord.',
    });
  };

  // Estilo visual según el tipo de log de auditoría
  const getLogBadgeStyle = (type: TicketActivityType) => {
    switch (type) {
      case 'add_staff':
        return {
          icon: UserPlus,
          label: 'Alta Staff',
          bg: 'bg-emerald-500/10',
          badgeBg: 'bg-emerald-500/20',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
        };
      case 'remove_staff':
        return {
          icon: Trash2,
          label: 'Baja Staff',
          bg: 'bg-rose-500/10',
          badgeBg: 'bg-rose-500/20',
          text: 'text-rose-400',
          border: 'border-rose-500/30',
        };
      case 'change_rank':
        return {
          icon: ArrowRightLeft,
          label: 'Cambio Rango',
          bg: 'bg-cyan-500/10',
          badgeBg: 'bg-cyan-500/20',
          text: 'text-cyan-400',
          border: 'border-cyan-500/30',
        };
      case 'copy_template':
        return {
          icon: Copy,
          label: 'Plantilla',
          bg: 'bg-purple-500/10',
          badgeBg: 'bg-purple-500/20',
          text: 'text-purple-400',
          border: 'border-purple-500/30',
        };
      case 'reset_counts':
        return {
          icon: RotateCcw,
          label: 'Reinicio',
          bg: 'bg-amber-500/10',
          badgeBg: 'bg-amber-500/20',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
        };
      case 'restore_roster':
        return {
          icon: Shield,
          label: 'Roster',
          bg: 'bg-indigo-500/10',
          badgeBg: 'bg-indigo-500/20',
          text: 'text-indigo-400',
          border: 'border-indigo-500/30',
        };
      case 'change_shift':
        return {
          icon: Clock,
          label: 'Turno',
          bg: 'bg-sky-500/10',
          badgeBg: 'bg-sky-500/20',
          text: 'text-sky-400',
          border: 'border-sky-500/30',
        };
      default:
        return {
          icon: ScrollText,
          label: 'Evento',
          bg: 'bg-white/10',
          badgeBg: 'bg-white/20',
          text: 'text-white',
          border: 'border-white/20',
        };
    }
  };

  // Filtrado de logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      if (logFilterType === 'staff') {
        if (log.type !== 'add_staff' && log.type !== 'remove_staff' && log.type !== 'change_rank') {
          return false;
        }
      } else if (logFilterType !== 'all' && log.type !== logFilterType) {
        return false;
      }

      if (!logFilterQuery.trim()) return true;
      const q = logFilterQuery.toLowerCase();
      return (
        log.title.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.operator && log.operator.toLowerCase().includes(q))
      );
    });
  }, [activityLogs, logFilterQuery, logFilterType]);

  // Filtrado de miembros en la vista
  const filteredRanksWithMembers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return ranks
      .filter((rank) => {
        if (selectedFilterRank === 'all') return true;
        if (selectedFilterRank === 'soportes') return rank.is_support;
        if (selectedFilterRank === 'staff_ig') return !rank.is_support;
        return rank.id === selectedFilterRank;
      })
      .map((rank) => {
        let rankMembers = members.filter((m) => m.rank_id === rank.id);

        if (q) {
          rankMembers = rankMembers.filter((m) => m.name.toLowerCase().includes(q));
        }

        // Siempre ordenados alfabéticamente
        const sorted = sortStaffAlphabetically(rankMembers);
        const subtotal = sorted.reduce((sum, m) => sum + m.count, 0);

        return {
          rank,
          members: sorted,
          subtotal,
          totalCount: rankMembers.length,
        };
      })
      .filter((item) => (searchQuery ? item.members.length > 0 : true));
  }, [ranks, members, searchQuery, selectedFilterRank]);

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* 
        ========================================================================
        CABECERA PRINCIPAL: ESTADÍSTICAS Y ACCIONES RÁPIDAS
        ========================================================================
      */}
      <GlassCard className="p-4 sm:p-5 relative overflow-hidden border border-white/[0.08] shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-white/[0.04] text-white/80 border border-white/[0.08] flex-shrink-0">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Conteo de Tickets HispanLifeRP
              </h1>
            </div>
          </div>

          {/* Acciones principales de la cabecera */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
            <ActionButton
              variant="secondary"
              size="sm"
              onClick={() => setIsAddStaffOpen(true)}
              className="border border-white/[0.08] text-white/80 hover:text-white hover:bg-white/[0.08]"
              title="Añadir nuevo miembro al equipo"
            >
              <UserPlus className="w-4 h-4 mr-1.5 text-white/70" />
              <span>Añadir Staff</span>
            </ActionButton>

            <ActionButton
              variant="secondary"
              size="sm"
              onClick={() => setIsActivityLogsModalOpen(true)}
              className="border border-white/[0.08] text-white/80 hover:text-white hover:bg-white/[0.08]"
              title="Ver registro de auditoría e interacciones importantes"
            >
              <ScrollText className="w-4 h-4 mr-1.5 text-white/70" />
              <span>Logs ({activityLogs.length})</span>
            </ActionButton>

            <ActionButton
              variant="secondary"
              size="sm"
              onClick={() => setIsHistoryModalOpen(true)}
              className="border border-white/[0.08] text-white/80 hover:text-white hover:bg-white/[0.08]"
              title="Ver conteos archivados"
            >
              <History className="w-4 h-4 mr-1.5 text-white/70" />
              <span>Historial ({sessionHistory.length})</span>
            </ActionButton>

            <ActionButton
              variant="secondary"
              size="sm"
              onClick={() => setIsConfirmResetOpen(true)}
              className="border border-white/[0.08] text-white/80 hover:text-rose-300 hover:bg-white/[0.08]"
              title="Poner todos los contadores a 0 para el siguiente conteo"
            >
              <RotateCcw className="w-4 h-4 mr-1.5 text-white/70" />
              <span>Reiniciar a 0</span>
            </ActionButton>

            {/* Botón rápido de sesión según el estado actual */}
            {isMySession ? (
              <ActionButton
                variant="primary"
                size="sm"
                onClick={handleFinishCountSession}
                disabled={isFinishingSession}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 text-xs"
                title="Finalizar el conteo oficial, archivar en Supabase y reiniciar a 0"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Finalizar Conteo</span>
              </ActionButton>
            ) : !activeSession?.is_active ? (
              <ActionButton
                variant="primary"
                size="sm"
                onClick={handleStartCountSession}
                disabled={isStartingSession}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs"
                title="Iniciar tu turno de conteo oficial sincronizado"
              >
                <Play className="w-4 h-4 mr-1.5 text-emerald-400" />
                <span>Iniciar Conteo</span>
              </ActionButton>
            ) : null}
          </div>
        </div>

        {/* ========================================================================
            BANNER DE ESTADO DE SESIÓN DE CONTEO EN TIEMPO REAL
            ======================================================================== */}
        <div className="mt-4 pt-4 border-t border-white/[0.08]">
          {activeSession?.is_active && !isMySession ? (
            <div className="p-3.5 rounded-2xl bg-amber-500/[0.08] border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg shadow-amber-950/20">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-amber-400 opacity-60"></span>
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      ● SESIÓN EN CURSO
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 font-bold border border-amber-500/30">
                      Turno {activeSession?.session_code || sessionCode}
                    </span>
                    <span className="text-[10px] text-white/50">
                      Fecha: {activeSession?.session_date || sessionDate}
                    </span>
                  </div>
                  <p className="text-xs text-white/90 mt-0.5">
                    <strong className="text-white font-bold">{activeSession?.operator_name || 'Staff'}</strong> está realizando el conteo oficial de tickets ({activeSession?.current_tickets_count || 0} tickets anotados hasta ahora).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-300/90 bg-amber-500/15 px-3 py-1.5 rounded-xl border border-amber-500/30">
                  En progreso por {activeSession?.operator_name || 'Staff'}
                </span>
              </div>
            </div>
          ) : isMySession ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg shadow-emerald-950/20">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-emerald-400 opacity-60"></span>
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                      ● TU SESIÓN DE CONTEO ACTIVA
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 font-bold border border-emerald-500/30">
                      Turno {activeSession?.session_code || sessionCode}
                    </span>
                    <span className="text-[10px] text-emerald-400/80 font-mono">
                      ● Sincronizando en vivo
                    </span>
                  </div>
                  <p className="text-xs text-white/90 mt-0.5">
                    Eres el operador actual del conteo. Total acumulado: <strong className="text-emerald-300 font-bold">{totalTicketsCount} tickets</strong> en {activeStaffCount} staffs activos.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
                <ActionButton
                  variant="primary"
                  size="sm"
                  onClick={handleFinishCountSession}
                  disabled={isFinishingSession}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  <span>Finalizar y Archivar</span>
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  size="sm"
                  onClick={handleReleaseCountSession}
                  className="border-white/10 text-white/70 hover:text-white hover:bg-white/[0.08] text-xs"
                >
                  <span>Liberar Sesión</span>
                </ActionButton>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-white/30 flex-shrink-0"></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/70 uppercase tracking-wider">
                      Sesión de Conteo
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/50 border border-white/[0.06]">
                      Disponible
                    </span>
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">
                    Ningún staff está realizando un conteo activo en este momento.
                  </p>
                </div>
              </div>
              <ActionButton
                variant="primary"
                size="sm"
                onClick={handleStartCountSession}
                disabled={isStartingSession}
                className="bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs w-full sm:w-auto justify-center"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 text-white" />
                <span>Iniciar Sesión de Conteo</span>
              </ActionButton>
            </div>
          )}
        </div>

        {/* Barra de Datos de Sesión: Fecha, Código y Métricas Globales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/[0.08]">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/[0.04] text-white/70 border border-white/[0.06]">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-[#8B949E] uppercase tracking-wider block">Fecha Plantilla</span>
              <input
                type="text"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-white w-full outline-none border-b border-transparent focus:border-white/30"
                placeholder="dd/mm/aaaa"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-white/60" />
                <span className="text-[10px] text-[#8B949E] uppercase tracking-wider font-semibold">
                  Turno Conteo
                </span>
              </div>
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                className="bg-transparent text-[11px] font-bold text-white/90 w-24 text-right outline-none border-b border-transparent focus:border-white/30"
                placeholder="MAÑANA"
                title="Turno reflejado en la cabecera Discord (*MAÑANA, *TARDE, *NOCHE)"
              />
            </div>
            <div className="flex items-center gap-1">
              {(
                [
                  {
                    key: 'MAÑANA',
                    label: 'Mañana',
                    icon: Sun,
                  },
                  {
                    key: 'TARDE',
                    label: 'Tarde',
                    icon: Sunset,
                  },
                  {
                    key: 'NOCHE',
                    label: 'Noche',
                    icon: Moon,
                  },
                ] as const
              ).map((shift) => {
                const isActive = sessionCode.toUpperCase().includes(shift.key);
                const Icon = shift.icon;
                return (
                  <button
                    key={shift.key}
                    type="button"
                    onClick={() => {
                      if (!sessionCode.toUpperCase().includes(shift.key)) {
                        setSessionCode(shift.key);
                        recordActivity(
                          'change_shift',
                          'Turno Cambiado',
                          `Turno de conteo modificado a ${shift.label} (*${shift.key}).`
                        );
                      }
                    }}
                    className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 border ${
                      isActive
                        ? 'bg-white/15 text-white border-white/20 shadow-sm'
                        : 'bg-white/[0.03] text-[#8B949E] hover:text-white hover:bg-white/[0.06] border-white/[0.04]'
                    }`}
                    title={`Seleccionar turno de ${shift.label.toLowerCase()}`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{shift.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/[0.04] text-white/70 border border-white/[0.06]">
              <Ticket className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] uppercase tracking-wider block">Total Intervenciones</span>
              <span className="text-sm font-black text-white">{totalTicketsCount} tickets</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/[0.04] text-white/70 border border-white/[0.06]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] uppercase tracking-wider block">Staffs con Tickets</span>
              <span className="text-sm font-black text-white">
                {activeStaffCount} <span className="text-xs text-[#8B949E]">/ {members.length}</span>
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 
        ========================================================================
        PANEL PRINCIPAL EN DOS COLUMNAS:
        - IZQUIERDA: CONTADORES POR RANGOS, DRAG & DROP Y BÚSQUEDA
        - DERECHA: PREVIEW EN VIVO DE LA PLANTILLA DISCORD & RECONOCIMIENTOS
        ========================================================================
      */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ====================================================================
            COLUMNA IZQUIERDA: LISTA DE RANGOS Y MIEMBROS (8 COLUMNAS)
            ==================================================================== */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Barra de Filtro y Buscador en Vivo */}
          <GlassCard className="p-3 border border-white/10 bg-black/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Buscar staff para sumar (ej. Delaisla, Drako, JOTA)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setSelectedFilterRank('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedFilterRank === 'all'
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Todos ({ranks.length})
              </button>
              <button
                onClick={() => setSelectedFilterRank('soportes')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedFilterRank === 'soportes'
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Soportes
              </button>
              <button
                onClick={() => setSelectedFilterRank('staff_ig')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedFilterRank === 'staff_ig'
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Staff IG
              </button>
            </div>
          </GlassCard>

          {/* Rótulo de Drag & Drop */}
          <div className="flex items-center justify-between text-[11px] text-[#8B949E] px-1">
            <span className="flex items-center gap-1.5">
              <GripVertical className="w-3.5 h-3.5 text-emerald-400" />
              Arrastra cualquier staff a otra categoría para ascenderlo, descenderlo o moverlo.
            </span>
            <span>Siempre ordenados alfabéticamente (A-Z)</span>
          </div>

          {/* Lista de Rangos */}
          <div
            className="space-y-4"
            onDragOver={(e) => {
              e.preventDefault();
              if (e.dataTransfer) {
                e.dataTransfer.dropEffect = 'move';
              }
            }}
          >
            {filteredRanksWithMembers.length === 0 ? (
              <GlassCard className="p-8 text-center border border-white/10 text-[#8B949E]">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-400" />
                <p className="text-sm font-semibold text-white">No se encontró ningún staff con ese nombre</p>
                <p className="text-xs mt-1">Prueba con otro término de búsqueda o añade al miembro con el botón superior.</p>
              </GlassCard>
            ) : (
              filteredRanksWithMembers.map(({ rank, members: rankMembers, subtotal, totalCount }) => {
                const isCollapsed = collapsedRanks[rank.id] ?? false;
                const isDragOver = dragOverRankId === rank.id;
                const isCandidateTarget = Boolean(
                  draggedMemberId && draggedMember?.rank_id !== rank.id
                );

                return (
                  <div
                    key={rank.id}
                    data-rank-id={rank.id}
                    onDragEnter={(e: React.DragEvent) => handleDragEnterRank(e, rank.id)}
                    onDragOver={(e: React.DragEvent) => handleDragOverRank(e, rank.id)}
                    onDrop={(e: React.DragEvent) => handleDropOnRank(e, rank.id)}
                    className="rounded-2xl transition-all"
                  >
                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden bg-[#0E1013]/60 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.45)] ${
                        isDragOver
                          ? 'border-emerald-400 bg-emerald-950/40 ring-2 ring-emerald-500/50 shadow-[0_0_35px_rgba(16,185,129,0.35)] scale-[1.008]'
                          : isCandidateTarget
                          ? 'border-emerald-500/30 bg-emerald-950/10 border-dashed hover:border-emerald-400/50'
                          : 'border-white/10 bg-black/40 hover:border-white/20'
                      }`}
                    >
                    {/* Subtle top specular sheen */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

                    {/* Cabecera del Rango */}
                    <div className="flex items-center justify-between gap-2 select-none">
                      <div
                        className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                        onClick={() =>
                          setCollapsedRanks((prev) => ({ ...prev, [rank.id]: !isCollapsed }))
                        }
                      >
                        <button className="text-white/60 hover:text-white p-0.5">
                          {isCollapsed ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronUp className="w-4 h-4" />
                          )}
                        </button>
                        <h2 className="text-sm font-bold text-white truncate tracking-wide">
                          {rank.name}
                        </h2>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-[#8B949E] font-medium border border-white/[0.08]">
                          {totalCount} miembros
                        </span>
                        {rank.is_support && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30">
                            SOPORTE
                          </span>
                        )}
                        {rank.is_high_staff && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 font-semibold border border-purple-500/30">
                            ALTA DIRECCIÓN (SIN @)
                          </span>
                        )}
                      </div>

                      {/* Subtotal del Rango */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-lg shadow-sm">
                          {subtotal} tickets
                        </span>
                      </div>
                    </div>

                    {/* Banner animado cuando se arrastra sobre este rango */}
                    <AnimatePresence>
                      {isDragOver && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, scale: 0.96 }}
                          animate={{ opacity: 1, height: 'auto', scale: 1 }}
                          exit={{ opacity: 0, height: 0, scale: 0.96 }}
                          transition={{ duration: 0.18 }}
                          className="my-2.5 py-2 px-3.5 rounded-xl border-2 border-dashed border-emerald-400/80 bg-emerald-500/20 text-emerald-200 flex items-center justify-center gap-2 text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] select-none pointer-events-none"
                        >
                          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span>
                            Soltar aquí para mover a {draggedMember?.name || 'staff'} a {rank.name}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Contenedor de Miembros */}
                    {!isCollapsed && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                        {rankMembers.length === 0 ? (
                          <div
                            onDragOver={(e) => handleDragOverRank(e, rank.id)}
                            onDrop={(e) => handleDropOnRank(e, rank.id)}
                            className={`col-span-2 py-4 px-3 rounded-xl border-2 border-dashed text-center transition-all ${
                              isDragOver
                                ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
                                : 'border-white/10 text-[#8B949E]'
                            }`}
                          >
                            <p className="text-xs italic">
                              No hay miembros en esta categoría. Arrastra a alguien aquí para asignarlo.
                            </p>
                          </div>
                        ) : (
                          rankMembers.map((member) => {
                            const isBeingDragged = draggedMemberId === member.id;
                            return (
                              <motion.div
                                layout
                                layoutId={member.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 450,
                                  damping: 32,
                                }}
                                key={member.id}
                                className="w-full"
                              >
                                <div
                                  onPointerDown={(e) => handlePointerDownCard(e, member)}
                                  className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-2.5 ${
                                    isBeingDragged
                                      ? 'opacity-30 border-dashed border-emerald-400 bg-emerald-950/30 scale-95 shadow-none'
                                      : member.count > 0
                                      ? 'bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:border-emerald-400/50'
                                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                  } group cursor-grab active:cursor-grabbing select-none`}
                                >
                                  {/* Nombre y Drag Handle */}
                                  <div className="flex items-center gap-2 min-w-0 flex-1 cursor-grab active:cursor-grabbing">
                                    <div
                                      className="p-1 rounded text-white/30 group-hover:text-emerald-400 transition-colors flex-shrink-0"
                                      title="Arrastra para mover a otro rango"
                                    >
                                      <GripVertical className="w-4 h-4" />
                                    </div>
                                    <span className="text-xs font-semibold text-white truncate pointer-events-none">
                                      {member.name}
                                    </span>
                                  </div>

                                  {/* Controles de Conteo: Menos, Número, Más */}
                                  <div
                                    className="flex items-center gap-1.5 flex-shrink-0"
                                    draggable={false}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onDragStart={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                  >
                                    {/* Botón Restar */}
                                    <button
                                      type="button"
                                      draggable={false}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        decrementCount(member.id, 1);
                                      }}
                                      disabled={member.count <= 0}
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                                        member.count > 0
                                          ? 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                                          : 'bg-white/[0.03] text-white/20 cursor-not-allowed border border-white/[0.05]'
                                      }`}
                                      title="Restar 1 ticket"
                                    >
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Input / Contador Directo */}
                                    <input
                                      type="number"
                                      min={0}
                                      draggable={false}
                                      value={member.count === 0 ? '' : member.count}
                                      placeholder="0"
                                      onChange={(e) =>
                                        setCountDirectly(member.id, parseInt(e.target.value) || 0)
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      className={`w-11 h-7 text-center rounded-lg text-xs font-mono font-bold outline-none border transition-all ${
                                        member.count > 0
                                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-inner'
                                          : 'bg-black/40 text-white/60 border-white/10 focus:border-white/30'
                                      }`}
                                    />

                                    {/* Botón Sumar */}
                                    <button
                                      type="button"
                                      draggable={false}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        incrementCount(member.id, 1);
                                      }}
                                      className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/40 flex items-center justify-center font-bold text-sm transition-all shadow-[0_0_10px_rgba(16,185,129,0.15)] active:scale-95"
                                      title="Sumar 1 ticket"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Selector Rápido de Rango */}
                                    <select
                                      draggable={false}
                                      value={member.rank_id}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        changeMemberRank(member.id, e.target.value);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      title="Cambiar categoría / ascenso / descenso"
                                      className="bg-black/60 border border-white/10 text-white/60 hover:text-white rounded-lg text-[10px] py-1 px-1 outline-none w-14 cursor-pointer focus:border-cyan-500/50"
                                    >
                                      {ranks.map((r) => (
                                        <option key={r.id} value={r.id} className="bg-neutral-900 text-white">
                                          {r.name.replace(/[『』🔰〽️📗📕🔮💿🌌]/g, '').trim()}
                                        </option>
                                      ))}
                                    </select>

                                    {/* Eliminar / Expulsar */}
                                    <button
                                      type="button"
                                      draggable={false}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeStaffMember(member.id, member.name);
                                      }}
                                      className="text-white/20 hover:text-rose-400 p-1 rounded transition-colors"
                                      title="Eliminar de la lista de staffs"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ====================================================================
            COLUMNA DERECHA: PREVIEW DE LA PLANTILLA DISCORD Y ACCIONES (4-5 COLS)
            ==================================================================== */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-4">
          <GlassCard className="p-4 sm:p-5 border border-white/[0.08] bg-[#0E1013]/60 shadow-xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white/70" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Salida de Plantilla Discord
                </h3>
              </div>
              <span className="text-[10px] text-white/70 font-mono font-semibold bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
                1-Click Copy
              </span>
            </div>

            {/* Ajuste de Ganadores / Menciones */}
            <div className="my-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#8B949E] font-medium flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Top Soporte (1 ó 2):
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setForceSupportCount(undefined)}
                    className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-all ${
                      forceSupportCount === undefined
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/[0.05] text-white/60 hover:text-white'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setForceSupportCount(1)}
                    className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-all ${
                      forceSupportCount === 1
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/[0.05] text-white/60 hover:text-white'
                    }`}
                  >
                    1
                  </button>
                  <button
                    onClick={() => setForceSupportCount(2)}
                    className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-all ${
                      forceSupportCount === 2
                        ? 'bg-emerald-500 text-black'
                        : 'bg-white/[0.05] text-white/60 hover:text-white'
                    }`}
                  >
                    2
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#8B949E] font-medium flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  Top Staff IG (1 ó 2):
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setForceStaffIgCount(undefined)}
                    className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-all ${
                      forceStaffIgCount === undefined
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white/[0.05] text-white/60 hover:text-white'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setForceStaffIgCount(1)}
                    className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-all ${
                      forceStaffIgCount === 1
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white/[0.05] text-white/60 hover:text-white'
                    }`}
                  >
                    1
                  </button>
                  <button
                    onClick={() => setForceStaffIgCount(2)}
                    className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-all ${
                      forceStaffIgCount === 2
                        ? 'bg-cyan-500 text-black'
                        : 'bg-white/[0.05] text-white/60 hover:text-white'
                    }`}
                  >
                    2
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-[#8B949E] leading-relaxed pt-1 border-t border-white/[0.06]">
                SuperAdmin hacia arriba no lleva <code className="text-white">@</code> para no saturar con menciones. Los staffs con 0 tickets no aparecen en la lista.
              </p>
            </div>

            {/* Reconocimientos Destacados en Vivo */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-1 mb-0.5">
                  <Award className="w-3.5 h-3.5" /> Top Soporte:
                </span>
                <span className="text-white font-bold text-xs truncate block">
                  {topPerformers.topSupports.length > 0
                    ? topPerformers.topSupports.map((s) => `${s.name} (${s.count})`).join(', ')
                    : 'Sin tickets'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
                <span className="text-[10px] text-cyan-300 font-semibold flex items-center gap-1 mb-0.5">
                  <Shield className="w-3.5 h-3.5" /> Top Staff IG:
                </span>
                <span className="text-white font-bold text-xs truncate block">
                  {topPerformers.topStaffIg.length > 0
                    ? topPerformers.topStaffIg.map((s) => `${s.name} (${s.count})`).join(', ')
                    : 'Sin tickets'}
                </span>
              </div>
            </div>

            {/* Cuadro de Salida Formateada para Discord */}
            <div className="relative">
              <pre className="w-full h-[400px] overflow-y-auto p-3.5 rounded-xl bg-black/90 border border-white/10 font-mono text-[11px] text-white/90 leading-relaxed whitespace-pre-wrap select-all shadow-inner">
                {discordSummaryOutput || 'No hay interacciones registradas aún.'}
              </pre>
            </div>

            {/* Botón Gigante de Copiado */}
            <button
              onClick={handleCopyDiscordSummary}
              className={`w-full mt-4 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
                copiedSuccess
                  ? 'bg-emerald-600 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              }`}
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>¡Copiado al Portapapeles! Listo para Discord</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copiar Resumen para Discord</span>
                </>
              )}
            </button>

            {/* Botón secundario para restablecer lista original */}
            <div className="mt-3 text-center">
              <button
                onClick={handleRestoreDefaultRoster}
                className="text-[11px] text-[#8B949E] hover:text-white underline transition-colors cursor-pointer"
              >
                Restablecer lista de 49 staffs y rangos originales
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* 
        ========================================================================
        MODAL: AÑADIR NUEVO STAFF
        ========================================================================
      */}
      <AnimatePresence>
        {isAddStaffOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-6 border border-white/10 bg-black/90 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">Añadir Nuevo Staff</h3>
                  </div>
                  <button
                    onClick={() => setIsAddStaffOpen(false)}
                    className="text-white/60 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddNewStaff} className="space-y-4">
                  <div>
                    <label className="text-xs text-[#8B949E] block mb-1">Nombre del Staff</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Delaisla, Drako..."
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#8B949E] block mb-1">Categoría / Rango</label>
                    <select
                      value={newStaffRank}
                      onChange={(e) => setNewStaffRank(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      {ranks.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddStaffOpen(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                    >
                      Guardar y Añadir
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 
        ========================================================================
        MODAL: CONFIRMAR REINICIO A CERO
        ========================================================================
      */}
      <AnimatePresence>
        {isConfirmResetOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-6 border border-rose-500/30 bg-black/90 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">¿Reiniciar Conteo a 0?</h3>
                    <p className="text-xs text-[#8B949E]">
                      Se restablecerán a 0 todos los tickets contados ({totalTicketsCount} tickets en total).
                    </p>
                  </div>
                </div>

                <p className="text-xs text-white/80 leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/10">
                  Los miembros del equipo y sus rangos <strong>NO se eliminarán</strong>, solo se limpiarán los números para empezar un nuevo turno o conteo.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <ActionButton
                    variant="ghost"
                    onClick={() => setIsConfirmResetOpen(false)}
                  >
                    Cancelar
                  </ActionButton>
                  <ActionButton
                    variant="secondary"
                    onClick={() => handleResetCounts(true)}
                    className="border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 text-xs"
                  >
                    Guardar en Historial y Reiniciar
                  </ActionButton>
                  <ActionButton
                    variant="primary"
                    onClick={() => handleResetCounts(false)}
                    className="bg-rose-500 hover:bg-rose-600 text-white text-xs"
                  >
                    Reiniciar Directo
                  </ActionButton>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 
        ========================================================================
        MODAL: HISTORIAL DE SESIONES PASADAS
        ========================================================================
      */}
      <AnimatePresence>
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[85vh] flex flex-col"
            >
              <GlassCard className="p-6 border border-white/10 bg-black/90 shadow-2xl flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-400" />
                    <h3 className="text-base font-bold text-white">Historial de Conteos Pasados</h3>
                  </div>
                  <button
                    onClick={() => setIsHistoryModalOpen(false)}
                    className="text-white/60 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {sessionHistory.length === 0 ? (
                    <p className="text-xs text-[#8B949E] text-center py-8">
                      No hay sesiones archivadas todavía. Al reiniciar un conteo terminado puedes guardarlo en el historial.
                    </p>
                  ) : (
                    sessionHistory.map((s) => (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">
                            Conteo del {s.date} (Turno: {formatShiftLabel(s.code)})
                          </span>
                          <span className="text-[11px] text-emerald-400 font-mono">
                            {s.total_tickets} tickets totales registrados
                          </span>
                          <span className="text-[10px] text-[#8B949E] block mt-0.5">
                            Archivado a las {s.created_at}
                          </span>
                        </div>
                        <ActionButton
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const summary = generateDiscordSummary({
                              date: s.date,
                              code: s.code,
                              ranks,
                              members: s.staff_members,
                            });
                            navigator.clipboard.writeText(summary);
                            playChime();
                            recordActivity(
                              'copy_template',
                              'Plantilla Copiada desde Historial',
                              `Resumen archivado del ${s.date} (Turno: ${s.code}) copiado al portapapeles.`,
                              `${s.total_tickets} tickets totales`
                            );
                            setToastMessage({
                              title: '¡Sesión Copiada!',
                              message: `Resumen del ${s.date} copiado al portapapeles.`,
                            });
                          }}
                          className="border border-white/10 text-xs"
                        >
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          Copiar Esta Plantilla
                        </ActionButton>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-4">
                  {sessionHistory.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm('¿Vaciar todo el historial de conteos archivados?')) {
                          setSessionHistory([]);
                        }
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Vaciar historial
                    </button>
                  )}
                  <ActionButton
                    variant="ghost"
                    onClick={() => setIsHistoryModalOpen(false)}
                    className="ml-auto"
                  >
                    Cerrar
                  </ActionButton>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 
        ========================================================================
        MODAL: REGISTRO DE AUDITORÍA Y LOGS DE INTERACCIÓN
        ========================================================================
      */}
      <AnimatePresence>
        {isActivityLogsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl max-h-[85vh] flex flex-col"
            >
              <GlassCard className="p-6 border border-purple-500/30 bg-[#0E1013]/95 shadow-[0_0_50px_rgba(168,85,247,0.2)] flex flex-col overflow-hidden max-h-[85vh]">
                <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <ScrollText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">Registro de Auditoría e Interacciones</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {activityLogs.length} eventos
                        </span>
                      </div>
                      <p className="text-xs text-[#8B949E] mt-0.5">
                        Historial de altas, bajas de staff, cambios de rango, reseteos y plantillas generadas.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsActivityLogsModalOpen(false)}
                    className="text-white/60 hover:text-white text-sm p-1 rounded-lg hover:bg-white/[0.06] transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Filtros y Buscador de Logs */}
                <div className="flex flex-col sm:flex-row items-center gap-2 mb-4 flex-shrink-0">
                  <div className="relative flex-1 w-full">
                    <Search className="w-3.5 h-3.5 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={logFilterQuery}
                      onChange={(e) => setLogFilterQuery(e.target.value)}
                      placeholder="Buscar en logs (staff, acción, turno)..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-[#8B949E] outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {[
                      { key: 'all', label: 'Todos' },
                      { key: 'staff', label: 'Staffs' },
                      { key: 'copy_template', label: 'Plantillas' },
                      { key: 'reset_counts', label: 'Reseteos' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setLogFilterType(tab.key)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                          logFilterType === tab.key
                            ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40'
                            : 'bg-white/[0.03] text-[#8B949E] hover:text-white border border-white/5'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lista de Registros */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-12">
                      <ScrollText className="w-8 h-8 text-[#8B949E]/40 mx-auto mb-2" />
                      <p className="text-xs text-[#8B949E]">
                        {activityLogs.length === 0
                          ? 'No hay registros de actividad todavía. Las interacciones importantes se registrarán automáticamente.'
                          : 'No se encontraron eventos con los filtros actuales.'}
                      </p>
                    </div>
                  ) : (
                    filteredLogs.map((log) => {
                      const badgeInfo = getLogBadgeStyle(log.type);
                      const Icon = badgeInfo.icon;
                      return (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex items-start gap-3"
                        >
                          <div
                            className={`p-2 rounded-lg ${badgeInfo.bg} ${badgeInfo.text} flex-shrink-0 mt-0.5 border ${badgeInfo.border}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{log.title}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${badgeInfo.badgeBg} ${badgeInfo.text} border ${badgeInfo.border}`}
                                >
                                  {badgeInfo.label}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#8B949E] font-mono">
                                {log.timestamp} • {log.date}
                              </span>
                            </div>
                            <p className="text-xs text-[#C9D1D9] mt-1 leading-relaxed">
                              {log.details}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-[#8B949E]">
                              <User className="w-3 h-3 text-white/50" />
                              <span>
                                Operador:{' '}
                                <strong className="text-white/80">{log.operator || 'Staff Local'}</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer del Modal con Acciones */}
                <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-4 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    {activityLogs.length > 0 && (
                      <>
                        <button
                          onClick={() => {
                            if (confirm('¿Vaciar todo el registro de auditoría de actividad?')) {
                              setActivityLogs([]);
                              setToastMessage({
                                title: 'Logs vaciados',
                                message: 'Se ha limpiado el historial de actividad.',
                              });
                            }
                          }}
                          className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          Vaciar logs
                        </button>
                        <span className="text-white/20">•</span>
                        <button
                          onClick={() => {
                            const reportText = activityLogs
                              .map(
                                (l) =>
                                  `[${l.date} ${l.timestamp}] [${l.operator || 'Staff'}] [${l.title.toUpperCase()}]: ${l.details}`
                              )
                              .join('\n');
                            navigator.clipboard.writeText(reportText);
                            playChime();
                            setToastMessage({
                              title: '¡Reporte Copiado!',
                              message: 'Registro de auditoría copiado al portapapeles.',
                            });
                          }}
                          className="text-xs text-purple-300 hover:text-purple-200 transition-colors"
                        >
                          Copiar reporte completo
                        </button>
                      </>
                    )}
                  </div>
                  <ActionButton
                    variant="ghost"
                    onClick={() => setIsActivityLogsModalOpen(false)}
                    className="ml-auto"
                  >
                    Cerrar
                  </ActionButton>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 
        ========================================================================
        NOTIFICACIÓN TOAST FLOTANTE
        ========================================================================
      */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm pointer-events-auto"
          >
            <div className="p-3.5 rounded-2xl bg-black/90 border border-emerald-500/40 shadow-[0_10px_35px_rgba(16,185,129,0.3)] backdrop-blur-xl flex items-start gap-3">
              <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white">{toastMessage.title}</h4>
                <p className="text-[11px] text-[#8B949E] mt-0.5 leading-relaxed">
                  {toastMessage.message}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Ghost Flotante para Arrastre con Puntero (100% Fluido, sin icono bloqueado) */}
      {isPointerDragging && draggedMember && (
        <div
          style={{
            position: 'fixed',
            left: pointerPos.x + 14,
            top: pointerPos.y + 14,
            pointerEvents: 'none',
            zIndex: 9999999,
          }}
          className="px-3.5 py-2.5 rounded-xl bg-neutral-900/95 border-2 border-emerald-400 text-white shadow-[0_15px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl flex items-center gap-2.5 w-60 ring-4 ring-emerald-500/25 scale-105 pointer-events-none"
        >
          <GripVertical className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold truncate flex-1">{draggedMember.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
            {draggedMember.count} tickets
          </span>
        </div>
      )}
    </div>
  );
};

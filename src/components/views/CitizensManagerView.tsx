import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  FolderOpen,
  Search,
  Check,
  Download,
  UploadCloud,
  Shield,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  HardDrive,
  CheckCircle2,
  X,
  Layers,
  Zap,
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useAuth } from '../../context/AuthContext';
import {
  CitizenRecord,
  FiveMCitizenInfo,
  fetchCitizens,
  createCitizen,
  updateCitizen,
  deleteCitizen,
  incrementCitizenDownload,
} from '../../services/citizens';

const COVER_PRESETS = [
  {
    name: 'PvP eSports (Arena)',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Potato 512x (Low End)',
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Clear Sky & Night',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Clean Water & FX',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
  },
];

export const CitizensManagerView: React.FC = () => {
  const { userRecord } = useAuth();
  const isAdmin = Boolean(userRecord?.is_admin);

  // Estados de catálogo y FiveM
  const [citizens, setCitizens] = useState<CitizenRecord[]>([]);
  const [info, setInfo] = useState<FiveMCitizenInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoClearCache, setAutoClearCache] = useState<boolean>(true);

  // Estados de acción
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionProgressMsg, setActionProgressMsg] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modales
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isConfirmVanillaOpen, setIsConfirmVanillaOpen] = useState<boolean>(false);
  const [runningAlertPendingAction, setRunningAlertPendingAction] = useState<(() => Promise<void>) | null>(null);

  // Formulario de Subida (Admin)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'pvp',
    performance_badge: '+45 FPS',
    description: '',
    cover_url: COVER_PRESETS[0].url,
    download_url: '',
    file_size_formatted: '850 MB',
    version: 'v1.0',
    is_published: true,
    is_featured: false,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cargar datos
  const loadData = async (silent: boolean = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [citizensList, fivemInfo] = await Promise.all([
        fetchCitizens(isAdmin),
        invoke<FiveMCitizenInfo>('get_fivem_citizen_info').catch(() => null),
      ]);
      setCitizens(citizensList);
      if (fivemInfo) setInfo(fivemInfo);
    } catch (err) {
      console.error('[CitizensManager] Error al sincronizar:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Polling ligero para monitorear si el usuario abre o cierra FiveM
    const interval = setInterval(() => {
      invoke<FiveMCitizenInfo>('get_fivem_citizen_info')
        .then((latest) => setInfo(latest))
        .catch(() => {});
    }, 4000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedbackToast({ type, message });
    setTimeout(() => setFeedbackToast(null), 5000);
  };

  // Guard de FiveM en ejecución
  const executeWithProcessGuard = async (action: () => Promise<void>) => {
    if (info?.is_fivem_running) {
      setRunningAlertPendingAction(() => action);
      return;
    }
    await action();
  };

  const handleForceCloseFiveMAndProceed = async () => {
    try {
      await invoke('force_kill_fivem_processes');
      showToast('success', 'FiveM cerrado de forma segura.');
      const pending = runningAlertPendingAction;
      setRunningAlertPendingAction(null);
      // Re-consultar info
      const latest = await invoke<FiveMCitizenInfo>('get_fivem_citizen_info');
      setInfo(latest);
      if (pending) {
        await pending();
      }
    } catch (err: any) {
      showToast('error', `Error al cerrar FiveM: ${err}`);
      setRunningAlertPendingAction(null);
    }
  };

  // Descargar y aplicar Citizen
  const handleDownloadAndApply = async (citizen: CitizenRecord) => {
    await executeWithProcessGuard(async () => {
      setActionLoadingId(citizen.id);
      setActionProgressMsg('Descargando y aplicando en FiveM...');
      try {
        await invoke('download_and_apply_citizen', {
          citizenId: citizen.id,
          downloadUrl: citizen.download_url,
          clearCache: autoClearCache,
        });

        // Incrementar contador de descargas
        incrementCitizenDownload(citizen.id);

        showToast('success', `¡Citizen '${citizen.title}' instalado y activado!`);
        loadData(true);
      } catch (err: any) {
        showToast('error', `Fallo al aplicar Citizen: ${err}`);
      } finally {
        setActionLoadingId(null);
        setActionProgressMsg('');
      }
    });
  };

  // Aplicar Citizen ya descargado en local
  const handleApplyLocal = async (citizen: CitizenRecord) => {
    await executeWithProcessGuard(async () => {
      setActionLoadingId(citizen.id);
      setActionProgressMsg('Cambiando a preset local...');
      try {
        await invoke('apply_local_citizen', {
          citizenId: citizen.id,
          clearCache: autoClearCache,
        });
        showToast('success', `Citizen '${citizen.title}' activado instantáneamente.`);
        loadData(true);
      } catch (err: any) {
        showToast('error', `Fallo al aplicar: ${err}`);
      } finally {
        setActionLoadingId(null);
        setActionProgressMsg('');
      }
    });
  };

  // Restaurar Vanilla
  const handleRestoreVanilla = async () => {
    await executeWithProcessGuard(async () => {
      setActionLoadingId('vanilla');
      setActionProgressMsg('Restaurando archivos Vanilla de fábrica...');
      try {
        await invoke('restore_vanilla_citizen', {
          clearCache: autoClearCache,
        });
        showToast('success', 'FiveM restaurado con éxito al Citizen Vanilla original de Rockstar.');
        setIsConfirmVanillaOpen(false);
        loadData(true);
      } catch (err: any) {
        showToast('error', `Fallo al restaurar: ${err}`);
      } finally {
        setActionLoadingId(null);
        setActionProgressMsg('');
      }
    });
  };

  // Eliminar copia local para liberar espacio
  const handleDeleteLocal = async (citizenId: string, title: string) => {
    try {
      await invoke('delete_local_citizen', { citizenId });
      showToast('success', `Archivos locales de '${title}' eliminados.`);
      loadData(true);
    } catch (err: any) {
      showToast('error', `Error: ${err}`);
    }
  };

  // Abrir carpeta en explorador
  const handleOpenFolder = async () => {
    try {
      await invoke('open_fivem_citizen_folder');
    } catch (err) {
      console.warn('Error al abrir carpeta:', err);
    }
  };

  // Admin: Toggle Publicado
  const handleTogglePublish = async (citizen: CitizenRecord) => {
    try {
      const updated = await updateCitizen(citizen.id, { is_published: !citizen.is_published });
      setCitizens((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      showToast('success', `Citizen ${updated.is_published ? 'publicado' : 'ocultado'}.`);
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Admin: Eliminar Citizen de la Nube
  const handleDeleteFromCloud = async (citizen: CitizenRecord) => {
    if (!confirm(`¿Estás seguro de eliminar '${citizen.title}' del catálogo en la nube?`)) return;
    try {
      await deleteCitizen(citizen.id);
      setCitizens((prev) => prev.filter((c) => c.id !== citizen.id));
      showToast('success', `Citizen '${citizen.title}' eliminado de la nube.`);
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Admin: Crear nuevo Citizen
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.download_url) {
      showToast('error', 'Por favor, introduce el título y la URL de descarga directa.');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createCitizen(uploadForm);
      setCitizens((prev) => [created, ...prev]);
      showToast('success', `¡Citizen '${created.title}' añadido con éxito al catálogo!`);
      setIsUploadModalOpen(false);
      setUploadForm({
        title: '',
        category: 'pvp',
        performance_badge: '+45 FPS',
        description: '',
        cover_url: COVER_PRESETS[0].url,
        download_url: '',
        file_size_formatted: '850 MB',
        version: 'v1.0',
        is_published: true,
        is_featured: false,
      });
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtros
  const filteredCitizens = useMemo(() => {
    return citizens.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.performance_badge.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'downloaded') {
        return info?.installed_citizen_ids.includes(c.id);
      }
      return c.category === selectedCategory;
    });
  }, [citizens, searchQuery, selectedCategory, info]);

  const categories = [
    { id: 'all', label: `Todos (${citizens.length})` },
    { id: 'pvp', label: `Competitivo PvP (${citizens.filter((c) => c.category === 'pvp').length})` },
    { id: 'fps_boost', label: `FPS Boost (${citizens.filter((c) => c.category === 'fps_boost').length})` },
    { id: 'sky_night', label: `Cielos & Noche (${citizens.filter((c) => c.category === 'sky_night').length})` },
    { id: 'effects', label: `Efectos & Audio (${citizens.filter((c) => c.category === 'effects').length})` },
    {
      id: 'downloaded',
      label: `Descargados (${citizens.filter((c) => info?.installed_citizen_ids.includes(c.id)).length})`,
    },
  ];

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col space-y-5 select-none text-white">
      {/* Toast Notification Flotante */}
      <AnimatePresence>
        {feedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-14 right-8 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl ${
              feedbackToast.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-200'
            }`}
          >
            {feedbackToast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="text-xs font-medium">{feedbackToast.message}</span>
            <button
              onClick={() => setFeedbackToast(null)}
              className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        ========================================================================
        CABECERA TELEMETRÍA Y CONTROLES PRINCIPALES
        ========================================================================
      */}
      <div className="p-5 rounded-2xl bg-[#0e1117]/80 backdrop-blur-xl border border-white/[0.08] shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">Gestor de Citizens</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  CLOUD MARKETPLACE
                </span>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ADMIN MODE
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8B949E]">
                Catálogo en la nube oficial: instala, descarga y cambia gráficos de FiveM en 1 solo clic.
              </p>
            </div>
          </div>
        </div>

        {/* Acciones y Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status FiveM Pill */}
          {info?.is_fivem_running ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>FiveM en Ejecución</span>
              <button
                onClick={() => handleForceCloseFiveMAndProceed()}
                title="Cerrar FiveM de forma forzada para aplicar cambios"
                className="ml-1 p-1 rounded-md bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>FiveM Cerrado • Listo</span>
            </div>
          )}

          {/* Ruta de FiveM */}
          <button
            onClick={handleOpenFolder}
            title={info?.citizen_path || 'Directorio FiveM'}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-[#CBD5E1] transition-all"
          >
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">FiveM.app\citizen</span>
          </button>

          {/* Botón Pánico Restaurar Vanilla */}
          <button
            onClick={() => setIsConfirmVanillaOpen(true)}
            disabled={actionLoadingId === 'vanilla'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.1] text-xs font-medium text-white transition-all shadow-sm"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Restaurar Vanilla</span>
          </button>

          {/* Botón Admin: Subir Citizen */}
          {isAdmin && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>+ Subir Citizen</span>
            </button>
          )}

          {/* Botón Refrescar */}
          <button
            onClick={() => loadData()}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/70 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 
        ========================================================================
        BARRA DE FILTROS, BÚSQUEDA Y OPCIONES
        ========================================================================
      */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Pestañas Categorías */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0e1117] border border-white/[0.08] overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-[#8B949E] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Buscador + Toggle Caché */}
        <div className="flex items-center gap-3">
          <label className="hidden lg:flex items-center gap-2 text-xs text-[#8B949E] cursor-pointer">
            <input
              type="checkbox"
              checked={autoClearCache}
              onChange={(e) => setAutoClearCache(e.target.checked)}
              className="rounded bg-black/40 border-white/20 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span>Auto-limpiar caché al cambiar</span>
          </label>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar citizen o FPS..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0e1117] border border-white/[0.08] text-xs text-white placeholder-[#8B949E] focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        GRID DE TARJETAS DE CITIZENS
        ========================================================================
      */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-[#8B949E] space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="text-xs">Sincronizando catálogo oficial con Supabase...</span>
        </div>
      ) : filteredCitizens.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-[#8B949E] space-y-3 rounded-2xl border border-white/[0.06] bg-[#0e1117]/40">
          <Layers className="w-10 h-10 text-white/20" />
          <p className="text-sm font-medium text-white">No se encontraron Citizens</p>
          <p className="text-xs max-w-sm text-center">
            {searchQuery
              ? 'Prueba con otro término de búsqueda o limpia los filtros.'
              : 'Aún no hay Citizens publicados en esta categoría.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCitizens.map((citizen) => {
            const isActive = info?.active_citizen_id === citizen.id;
            const isDownloaded = info?.installed_citizen_ids.includes(citizen.id);
            const isActionLoading = actionLoadingId === citizen.id;

            return (
              <div
                key={citizen.id}
                className={`group relative rounded-2xl overflow-hidden border transition-all duration-200 flex flex-col bg-[#12151d] ${
                  isActive
                    ? 'border-cyan-400/80 shadow-[0_0_30px_rgba(0,240,255,0.2)] ring-1 ring-cyan-400/50'
                    : 'border-white/[0.08] hover:border-white/[0.18] hover:shadow-glassHover'
                }`}
              >
                {/* Cover Image con Overlay */}
                <div className="relative h-40 w-full overflow-hidden bg-black/40">
                  <img
                    src={citizen.cover_url}
                    alt={citizen.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12151d] via-[#12151d]/40 to-transparent" />

                  {/* Badges Flotantes Superiores */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium tracking-wide bg-black/60 backdrop-blur-md border border-white/10 text-white">
                      {citizen.category.toUpperCase()}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wide bg-cyan-500/20 backdrop-blur-md border border-cyan-400/40 text-cyan-300 shadow-sm">
                      {citizen.performance_badge}
                    </span>
                  </div>

                  {/* Badge de No Publicado (Solo Admin) */}
                  {!citizen.is_published && (
                    <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-amber-500/30 text-amber-300 border border-amber-500/40">
                      BORRADOR / OCULTO
                    </div>
                  )}
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                      {citizen.title}
                    </h3>
                    <p className="text-xs text-[#8B949E] mt-1.5 leading-relaxed line-clamp-2">
                      {citizen.description}
                    </p>
                  </div>

                  {/* Metadatos: Tamaño, Versión, Descargas */}
                  <div className="pt-2 flex items-center justify-between border-t border-white/[0.06] text-[11px] font-mono text-[#8B949E]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-white/80">
                        <HardDrive className="w-3 h-3 text-cyan-400" />
                        {citizen.file_size_formatted}
                      </span>
                      <span>{citizen.version}</span>
                    </div>
                    <span className="text-[#6E7681]">⬇️ {citizen.downloads_count} users</span>
                  </div>

                  {/* Controles de Administrador */}
                  {isAdmin && (
                    <div className="pt-2 flex items-center justify-between border-t border-white/[0.04] text-[11px]">
                      <span className="text-[10px] font-mono text-purple-400">Admin Options:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleTogglePublish(citizen)}
                          title={citizen.is_published ? 'Ocultar a usuarios' : 'Publicar a usuarios'}
                          className="p-1 rounded bg-white/[0.04] hover:bg-white/[0.1] text-white/80"
                        >
                          {citizen.is_published ? (
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteFromCloud(citizen)}
                          title="Eliminar Citizen de la nube"
                          className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Botón de Acción Principal */}
                  <div className="pt-1">
                    {isActive ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 shadow-inner">
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Instalado & Activo en FiveM</span>
                      </div>
                    ) : isDownloaded ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApplyLocal(citizen)}
                          disabled={isActionLoading}
                          className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
                        >
                          {isActionLoading ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Aplicando...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3 fill-current" />
                              <span>Aplicar (1-Click)</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteLocal(citizen.id, citizen.title)}
                          title="Eliminar copia local descargada para liberar espacio"
                          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDownloadAndApply(citizen)}
                        disabled={isActionLoading}
                        className="w-full py-2 px-3 rounded-xl bg-white/[0.08] hover:bg-cyan-500 hover:text-black text-white text-xs font-bold border border-white/[0.1] hover:border-cyan-400 flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        {isActionLoading ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>{actionProgressMsg || 'Descargando...'}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar y Aplicar</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 
        ========================================================================
        MODAL CONFIRMACIÓN RESTAURAR VANILLA
        ========================================================================
      */}
      <AnimatePresence>
        {isConfirmVanillaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl bg-[#12151d] border border-white/[0.12] shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Restaurar Citizen Vanilla Original</h3>
                  <p className="text-xs text-[#8B949E]">Archivos 100% originales de Rockstar Games</p>
                </div>
              </div>

              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Esta acción eliminará cualquier textura o preset gráfico modificado actualmente y restaurará la carpeta
                <code className="text-cyan-400 font-mono mx-1">citizen</code> a su estado de fábrica limpio.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setIsConfirmVanillaOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRestoreVanilla}
                  disabled={actionLoadingId === 'vanilla'}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  {actionLoadingId === 'vanilla' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Restaurando...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Confirmar y Restaurar</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 
        ========================================================================
        MODAL ADVERTENCIA FIVEM EN EJECUCIÓN (PROCESS GUARD)
        ========================================================================
      */}
      <AnimatePresence>
        {runningAlertPendingAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl bg-[#12151d] border border-amber-500/30 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">FiveM está en Ejecución</h3>
                  <p className="text-xs text-amber-300">Protección contra corrupción de archivos activa</p>
                </div>
              </div>

              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Windows bloquea la modificación de archivos mientras el juego corre. Para evitar que la instalación se rompa,
                debes cerrar FiveM antes de aplicar el Citizen.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setRunningAlertPendingAction(null)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleForceCloseFiveMAndProceed}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cerrar FiveM y Continuar</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 
        ========================================================================
        MODAL SUBIDA NUEVO CITIZEN (ADMIN ONLY)
        ========================================================================
      */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl p-6 rounded-2xl bg-[#12151d] border border-white/[0.12] shadow-2xl space-y-5 my-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <UploadCloud className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Subir Nuevo Citizen al Catálogo</h3>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                {/* Título */}
                <div className="space-y-1">
                  <label className="text-white/80 font-medium">Nombre / Título del Preset</label>
                  <input
                    type="text"
                    required
                    placeholder="ej: g0d eSports PvP Ultimate v2"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Categoría y Badge */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-white/80 font-medium">Categoría</label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="pvp">Competitivo PvP</option>
                      <option value="fps_boost">FPS Boost Ultra</option>
                      <option value="sky_night">Cielos & Noche</option>
                      <option value="effects">Efectos & Audio</option>
                      <option value="potato">Potato / Low End</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/80 font-medium">Badge de Rendimiento</label>
                    <input
                      type="text"
                      placeholder="ej: +45 FPS, PVP READY"
                      value={uploadForm.performance_badge}
                      onChange={(e) => setUploadForm({ ...uploadForm, performance_badge: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* URL de Descarga Directa (.zip) */}
                <div className="space-y-1">
                  <label className="text-white/80 font-medium">URL de Descarga Directa (.zip)</label>
                  <input
                    type="url"
                    required
                    placeholder="https://.../citizen_preset.zip"
                    value={uploadForm.download_url}
                    onChange={(e) => setUploadForm({ ...uploadForm, download_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                  />
                  <p className="text-[10px] text-[#8B949E]">
                    Enlace directo al paquete .zip (GitHub Releases, Supabase Storage, CDN o servidor privado).
                  </p>
                </div>

                {/* Tamaño y Versión */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-white/80 font-medium">Peso Aproximado</label>
                    <input
                      type="text"
                      placeholder="ej: 850 MB"
                      value={uploadForm.file_size_formatted}
                      onChange={(e) => setUploadForm({ ...uploadForm, file_size_formatted: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-white/80 font-medium">Versión</label>
                    <input
                      type="text"
                      placeholder="ej: v1.0"
                      value={uploadForm.version}
                      onChange={(e) => setUploadForm({ ...uploadForm, version: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-1">
                  <label className="text-white/80 font-medium">Descripción y Tweaks incluidos</label>
                  <textarea
                    rows={2}
                    placeholder="Detalla los cambios (niebla, lluvia, sombras, sangre, etc.)..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>

                {/* Imagen de Portada */}
                <div className="space-y-1.5">
                  <label className="text-white/80 font-medium">Imagen de Portada (URL o Presets)</label>
                  <input
                    type="url"
                    placeholder="https://.../cover.jpg"
                    value={uploadForm.cover_url}
                    onChange={(e) => setUploadForm({ ...uploadForm, cover_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                  />
                  <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                    <span className="text-[10px] text-[#8B949E] whitespace-nowrap">Presets rápidos:</span>
                    {COVER_PRESETS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setUploadForm({ ...uploadForm, cover_url: preset.url })}
                        className={`px-2 py-1 rounded text-[10px] border whitespace-nowrap ${
                          uploadForm.cover_url === preset.url
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                            : 'bg-white/[0.04] text-white/70 border-white/[0.08]'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Switch de Publicación */}
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={uploadForm.is_published}
                      onChange={(e) => setUploadForm({ ...uploadForm, is_published: e.target.checked })}
                      className="rounded bg-black/40 border-white/20 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-white">Publicar inmediatamente en el catálogo</span>
                  </label>
                </div>

                {/* Botones de Envío */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Publicando...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Subir y Guardar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

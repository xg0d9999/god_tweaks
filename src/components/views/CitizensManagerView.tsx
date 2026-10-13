import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  FileArchive,
  ImageIcon,
  Clipboard,
  Maximize2,
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
  uploadCitizenPackage,
  uploadCitizenCover,
} from '../../services/citizens';

const COVER_PRESETS = [
  {
    name: 'PvP eSports (Arena)',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'FPS Boost Ultra',
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Calidad Gráfica HD',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
  },
  {
    name: 'Patata Low-End',
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop',
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
  const [selectedCategory, setSelectedCategory] = useState<string>('pvp');
  const [autoClearCache, setAutoClearCache] = useState<boolean>(true);

  // Modal de vista previa de imagen en alta resolución
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Estados de acción
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionProgressMsg, setActionProgressMsg] = useState<string>('');
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modales
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isConfirmVanillaOpen, setIsConfirmVanillaOpen] = useState<boolean>(false);
  const [runningAlertPendingAction, setRunningAlertPendingAction] = useState<(() => Promise<void>) | null>(null);

  // Subida de archivos en modal
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPackage, setIsUploadingPackage] = useState<boolean>(false);
  const [uploadedPackageName, setUploadedPackageName] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState<boolean>(false);
  const [showManualUrl, setShowManualUrl] = useState<boolean>(false);

  // Formulario de Subida (Admin)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'pvp',
    performance_badge: '+45 FPS',
    description: '',
    cover_url: COVER_PRESETS[0].url,
    download_url: '',
    file_size_formatted: '850 MB',
    file_size_bytes: 891289600,
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

  // Subida de imagen portada helper
  const handleUploadCoverBlob = async (file: File) => {
    setIsUploadingCover(true);
    try {
      showToast('success', 'Subiendo imagen pegada a Storage...');
      const coverUrl = await uploadCitizenCover(file);
      setUploadForm((prev) => ({ ...prev, cover_url: coverUrl }));
      showToast('success', '✓ Captura adjuntada y vinculada con éxito');
    } catch (err: any) {
      showToast('error', `Error al subir imagen: ${err.message}`);
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Listener para Ctrl+V de imágenes copiadas en el portapapeles
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isUploadModalOpen) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleUploadCoverBlob(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isUploadModalOpen]);

  // Pegar manualmente desde botón del portapapeles
  const handlePasteFromClipboardBtn = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const file = new File([blob], `clipboard_${Date.now()}.png`, { type: imageType });
            await handleUploadCoverBlob(file);
            return;
          }
        }
      }
      showToast('error', 'No se detectó ninguna imagen en el portapapeles. Copia una captura y pulsa Ctrl+V.');
    } catch {
      showToast('error', 'Copia una imagen y presiona Ctrl+V dentro del modal.');
    }
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

  // Eliminar copia local
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

  // Admin: Manejar selección y subida automática de .zip / .rar a Supabase Storage
  const handlePackageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPackage(true);
    setUploadedPackageName(file.name);
    try {
      showToast('success', `Subiendo ${file.name} a Supabase Storage...`);
      const { publicUrl, fileSizeFormatted, fileSizeBytes } = await uploadCitizenPackage(file);

      setUploadForm((prev) => ({
        ...prev,
        download_url: publicUrl,
        file_size_formatted: fileSizeFormatted,
        file_size_bytes: fileSizeBytes,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      }));

      showToast('success', '¡Archivo subido a Storage y vinculado correctamente!');
    } catch (err: any) {
      console.error(err);
      showToast('error', `Error al subir a Storage: ${err.message}`);
      setUploadedPackageName(null);
    } finally {
      setIsUploadingPackage(false);
    }
  };

  // Admin: Subir imagen de portada desde selector de archivos
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUploadCoverBlob(file);
    }
  };

  // Admin: Crear nuevo Citizen
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.download_url) {
      showToast('error', 'Por favor, sube un archivo .zip/.rar o introduce la URL de descarga directa.');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createCitizen(uploadForm);
      setCitizens((prev) => [created, ...prev]);
      showToast('success', `¡Citizen '${created.title}' añadido con éxito al catálogo!`);
      setIsUploadModalOpen(false);
      setUploadedPackageName(null);
      setUploadForm({
        title: '',
        category: 'pvp',
        performance_badge: '+45 FPS',
        description: '',
        cover_url: COVER_PRESETS[0].url,
        download_url: '',
        file_size_formatted: '850 MB',
        file_size_bytes: 891289600,
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

  // Filtros: Solo Competitivo PvP, FPS Boost Ultra, Calidad Gráfica y Patata
  const filteredCitizens = useMemo(() => {
    return citizens.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      return c.category === selectedCategory;
    });
  }, [citizens, searchQuery, selectedCategory]);

  const categories = [
    { id: 'pvp', label: `Competitivo PvP (${citizens.filter((c) => c.category === 'pvp').length})` },
    { id: 'fps_boost', label: `FPS Boost Ultra (${citizens.filter((c) => c.category === 'fps_boost').length})` },
    { id: 'graphics_quality', label: `Calidad Gráfica (${citizens.filter((c) => c.category === 'graphics_quality').length})` },
    { id: 'potato', label: `Patata (${citizens.filter((c) => c.category === 'potato').length})` },
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
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8B949E]">
                Instala y cambia los gráficos de FiveM en 1 solo clic.
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
                title="Cerrar FiveM para aplicar cambios"
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
            <span className="hidden sm:inline">Carpeta citizen</span>
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
        BARRA DE FILTROS Y BÚSQUEDA (Solo las 4 categorías requeridas)
        ========================================================================
      */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Pestañas de Categorías */}
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
            <span>Auto-limpiar caché</span>
          </label>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0e1117] border border-white/[0.08] text-xs text-white placeholder-[#8B949E] focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        GRID DE TARJETAS DE CITIZENS (Limpias, sin badges invasivas)
        ========================================================================
      */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-[#8B949E] space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="text-xs">Cargando citizens...</span>
        </div>
      ) : filteredCitizens.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-[#8B949E] space-y-3 rounded-2xl border border-white/[0.06] bg-[#0e1117]/40">
          <Layers className="w-10 h-10 text-white/20" />
          <p className="text-sm font-medium text-white">No hay Citizens en esta categoría</p>
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
                {/* Cover Image con Clic para ver foto completa */}
                <div
                  onClick={() => setPreviewImage({ url: citizen.cover_url, title: citizen.title })}
                  className="relative h-44 w-full overflow-hidden bg-black/40 cursor-pointer group/img"
                  title="Haz clic para ver captura completa en grande"
                >
                  <img
                    src={citizen.cover_url}
                    alt={citizen.title}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12151d] via-[#12151d]/30 to-transparent" />

                  {/* Icono de zoom en hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 bg-black/30 backdrop-blur-[2px] transition-opacity">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-white/20 text-white text-xs font-medium">
                      <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ver captura</span>
                    </div>
                  </div>
                </div>

                {/* Contenido de la Tarjeta (Limpio y directo) */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                      {citizen.title}
                    </h3>
                    <p className="text-xs text-[#8B949E] mt-1.5 leading-relaxed line-clamp-2">
                      {citizen.description}
                    </p>
                  </div>

                  {/* Metadatos limpios */}
                  <div className="pt-2 flex items-center justify-between border-t border-white/[0.06] text-[11px] font-mono text-[#8B949E]">
                    <span className="flex items-center gap-1 text-white/80">
                      <HardDrive className="w-3 h-3 text-cyan-400" />
                      {citizen.file_size_formatted}
                    </span>

                    {/* Controles rápidos de Admin si procede */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePublish(citizen);
                          }}
                          title={citizen.is_published ? 'Ocultar' : 'Publicar'}
                          className="p-1 rounded bg-white/[0.04] hover:bg-white/[0.1] text-white/80"
                        >
                          {citizen.is_published ? (
                            <Eye className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-amber-400" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFromCloud(citizen);
                          }}
                          title="Eliminar de la nube"
                          className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Botón de Acción Principal */}
                  <div className="pt-1">
                    {isActive ? (
                      <div className="w-full py-2 px-3 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 shadow-inner">
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Activo en FiveM</span>
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
                          title="Eliminar archivos locales"
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
        MODAL LIGHTBOX: VER FOTO DE CÓMO SE VE EL CITIZEN EN GRANDE
        ========================================================================
      */}
      <AnimatePresence>
        {previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-xl cursor-zoom-out"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] flex flex-col rounded-2xl overflow-hidden bg-[#12151d] border border-white/20 shadow-2xl cursor-default"
            >
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white backdrop-blur-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-hidden flex items-center justify-center bg-black/50">
                <img
                  src={previewImage.url}
                  alt={previewImage.title}
                  className="w-full max-h-[75vh] object-contain select-none"
                />
              </div>

              <div className="p-4 bg-[#0e1117] border-t border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{previewImage.title}</h4>
                  <p className="text-xs text-[#8B949E]">Captura visual del Citizen en partida</p>
                </div>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-medium text-white transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
        MODAL SUBIDA NUEVO CITIZEN (ADMIN ONLY) CON PEGAR CTRL+V DIRECTO
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
                  <div>
                    <h3 className="text-base font-bold text-white">Subir Nuevo Citizen al Catálogo</h3>
                    <p className="text-[11px] text-[#8B949E]">
                      Sube tu .zip o .rar y pega la captura de pantalla directamente con Ctrl+V
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                {/* ZONA DE CARGA AUTOMÁTICA DE ARCHIVO .ZIP / .RAR */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-white/90 font-semibold flex items-center gap-1.5">
                      <FileArchive className="w-4 h-4 text-cyan-400" />
                      <span>Paquete del Citizen (.zip o .rar)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowManualUrl(!showManualUrl)}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      {showManualUrl ? 'Subir archivo de mi PC' : 'O pegar URL manual'}
                    </button>
                  </div>

                  {!showManualUrl ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        uploadForm.download_url
                          ? 'border-emerald-500/50 bg-emerald-500/10'
                          : 'border-white/15 hover:border-cyan-400/50 hover:bg-white/[0.02]'
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handlePackageFileChange}
                        accept=".zip,.rar,.7z"
                        className="hidden"
                      />

                      {isUploadingPackage ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                          <span className="font-medium text-cyan-300">
                            Subiendo paquete a Supabase Storage...
                          </span>
                          <span className="text-[10px] text-[#8B949E]">{uploadedPackageName}</span>
                        </div>
                      ) : uploadForm.download_url ? (
                        <div className="flex flex-col items-center gap-1.5 py-1">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                          <span className="font-semibold text-emerald-300">
                            ¡Archivo subido y vinculado con éxito!
                          </span>
                          <span className="text-[11px] font-mono text-[#CBD5E1]">
                            {uploadedPackageName || 'Paquete listo en Storage'} • {uploadForm.file_size_formatted}
                          </span>
                          <span className="text-[10px] text-emerald-400/80 underline mt-1">
                            Haz clic para reemplazar por otro archivo
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 py-2">
                          <UploadCloud className="w-7 h-7 text-white/40" />
                          <span className="font-medium text-white">
                            Haz clic aquí o arrastra tu archivo <strong className="text-cyan-400">.zip</strong> o{' '}
                            <strong className="text-cyan-400">.rar</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="url"
                        placeholder="https://.../citizen_preset.zip o .rar"
                        value={uploadForm.download_url}
                        onChange={(e) => setUploadForm({ ...uploadForm, download_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                      />
                    </div>
                  )}
                </div>

                {/* ZONA DE CAPTURA DE PANTALLA: PEGAR DIRECTO CON CTRL+V */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-white/90 font-semibold flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-cyan-400" />
                      <span>Captura de Fondo / Portada</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePasteFromClipboardBtn}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-[11px] font-medium transition-colors"
                      >
                        <Clipboard className="w-3 h-3" />
                        <span>Pegar captura (Ctrl+V)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="text-[11px] text-[#8B949E] hover:text-white underline"
                      >
                        Subir archivo
                      </button>
                    </div>
                    <input
                      type="file"
                      ref={coverInputRef}
                      onChange={handleCoverFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* Previsualización de la portada actual */}
                  <div className="relative h-28 w-full rounded-xl overflow-hidden border border-white/10 bg-black/40">
                    <img
                      src={uploadForm.cover_url}
                      alt="Vista previa de portada"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                      <span className="text-[11px] bg-black/70 px-3 py-1 rounded-lg text-white/90 border border-white/10">
                        {isUploadingCover ? 'Subiendo imagen pegada...' : 'Puedes pulsar Ctrl+V aquí para pegar una captura'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Título */}
                <div className="space-y-1">
                  <label className="text-white/80 font-medium">Nombre / Título del Preset</label>
                  <input
                    type="text"
                    required
                    placeholder="ej: g0d eSports PvP Ultimate"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Categoría */}
                <div className="space-y-1">
                  <label className="text-white/80 font-medium">Categoría</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="pvp">Competitivo PvP</option>
                    <option value="fps_boost">FPS Boost Ultra</option>
                    <option value="graphics_quality">Calidad Gráfica</option>
                    <option value="potato">Patata</option>
                  </select>
                </div>

                {/* Descripción */}
                <div className="space-y-1">
                  <label className="text-white/80 font-medium">Descripción breve</label>
                  <textarea
                    rows={2}
                    placeholder="Detalles del preset visual..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-400 resize-none"
                  />
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
                    disabled={isSubmitting || isUploadingPackage}
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-xs font-bold transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
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

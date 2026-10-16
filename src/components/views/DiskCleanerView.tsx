import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HardDrive,
  Trash2,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Layers,
  Database,
  ShieldCheck,
  CheckSquare,
  Square,
  PieChart,
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { ActionButton } from "../ui/ActionButton";
import { safeInvoke } from "../../utils/safeInvoke";
import {
  DiskDriveInfo,
  DiskJunkScanResult,
  DiskCleanResult,
  FolderConsumptionItem,
} from "../../types";

export const DiskCleanerView: React.FC = () => {
  const [drives, setDrives] = useState<DiskDriveInfo[]>([]);
  const [scanResult, setScanResult] = useState<DiskJunkScanResult | null>(null);
  const [folderBreakdown, setFolderBreakdown] = useState<FolderConsumptionItem[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string>("all");

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [lastCleanResult, setLastCleanResult] = useState<DiskCleanResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Play modern chime audio on success
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
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  const loadDrivesAndBreakdown = async () => {
    try {
      const detectedDrives = await safeInvoke<DiskDriveInfo[]>("get_disk_drives");
      if (Array.isArray(detectedDrives) && detectedDrives.length > 0) {
        setDrives(detectedDrives);
      }
      const breakdown = await safeInvoke<FolderConsumptionItem[]>("get_disk_consumption_breakdown");
      if (Array.isArray(breakdown) && breakdown.length > 0) {
        setFolderBreakdown(breakdown);
      }
    } catch (e) {
      console.error("Error loading drives:", e);
    }
  };

  const handleScanJunk = async () => {
    setIsScanning(true);
    try {
      const res = await safeInvoke<DiskJunkScanResult>("scan_disk_junk");
      if (res && Array.isArray(res.categories)) {
        setScanResult(res);
        // Auto-select recommended safe categories by default
        const recommended = res.categories
          .filter((c) => c && c.recommended)
          .map((c) => c.id);
        setSelectedCategoryIds(recommended);
        setToastMessage(`Escaneo finalizado: ${res.formatted_total || "0 B"} de archivos basura detectados.`);
      } else {
        setToastMessage("Escaneo completado sin datos.");
      }
    } catch (e) {
      console.error("Error al escanear:", e);
      setToastMessage(`Error al escanear: ${String(e)}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCleanSelected = async () => {
    if (selectedCategoryIds.length === 0) {
      setToastMessage("Selecciona al menos una categoría para limpiar.");
      return;
    }

    setIsCleaning(true);
    try {
      const res = await safeInvoke<DiskCleanResult>("clean_disk_junk", {
        category_ids: selectedCategoryIds,
        categoryIds: selectedCategoryIds,
      });
      setLastCleanResult(res);
      playChime();
      setToastMessage(`¡Éxito! Se han liberado ${res?.formatted_freed || "0 B"} en tu disco.`);
      // Refresh drives and re-scan
      await loadDrivesAndBreakdown();
      const updatedScan = await safeInvoke<DiskJunkScanResult>("scan_disk_junk");
      if (updatedScan && Array.isArray(updatedScan.categories)) {
        setScanResult(updatedScan);
        const validIds = updatedScan.categories
          .filter((c) => c && c.recommended)
          .map((c) => c.id);
        setSelectedCategoryIds(validIds);
      }
    } catch (e) {
      setToastMessage(`Error en la limpieza: ${String(e)}`);
    } finally {
      setIsCleaning(false);
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllSafe = () => {
    if (!scanResult || !Array.isArray(scanResult.categories)) return;
    const safeIds = scanResult.categories.filter((c) => c && c.is_safe).map((c) => c.id);
    setSelectedCategoryIds(safeIds);
  };

  const selectAll = () => {
    if (!scanResult || !Array.isArray(scanResult.categories)) return;
    setSelectedCategoryIds(scanResult.categories.filter(Boolean).map((c) => c.id));
  };

  const deselectAll = () => {
    setSelectedCategoryIds([]);
  };

  // Initial load
  useEffect(() => {
    loadDrivesAndBreakdown();
    handleScanJunk();
  }, []);

  // Toast timer
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const selectedBytes = scanResult && Array.isArray(scanResult.categories)
    ? scanResult.categories
        .filter((c) => c && selectedCategoryIds.includes(c.id))
        .reduce((acc, curr) => acc + (Number(curr?.bytes) || 0), 0)
    : 0;

  const formatBytes = (bytes: number): string => {
    const num = Number(bytes);
    if (isNaN(num) || num <= 0) return "0 B";
    const KB = 1024;
    const MB = KB * 1024;
    const GB = MB * 1024;
    if (num >= GB) return `${(num / GB).toFixed(2)} GB`;
    if (num >= MB) return `${(num / MB).toFixed(1)} MB`;
    if (num >= KB) return `${(num / KB).toFixed(0)} KB`;
    return `${num} B`;
  };

  const filteredCategories = scanResult && Array.isArray(scanResult.categories)
    ? scanResult.categories.filter((cat) => {
        if (!cat) return false;
        if (filterType === "all") return true;
        return cat.category_type === filterType;
      })
    : [];

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* 
        ========================================================================
        CABECERA PRINCIPAL: ESTILO MAC / RAYCAST CON BOTONES DE ACCIÓN
        ========================================================================
      */}
      <GlassCard className="p-4 sm:p-5 relative overflow-hidden border border-white/10 bg-gradient-to-r from-emerald-950/25 via-black/40 to-cyan-950/20 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.25)] flex-shrink-0">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Limpieza & Analizador de Disco
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Modo Win32 Nativo
                </span>
              </div>
              <p className="text-xs text-[#8B949E] mt-1 leading-relaxed">
                Analiza qué está consumiendo el tamaño de tu almacenamiento y elimina gigas de cachés, temporales y datos obsoletos.
              </p>
            </div>
          </div>

          {/* Acciones principales de la cabecera */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
            <ActionButton
              variant="secondary"
              size="sm"
              onClick={handleScanJunk}
              disabled={isScanning || isCleaning}
              className="border border-white/10 text-white/90 hover:bg-white/[0.08]"
              title="Volver a escanear unidades en busca de archivos basura"
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 text-cyan-400 ${isScanning ? "animate-spin" : ""}`} />
              <span>{isScanning ? "Escaneando..." : "Analizar Disco"}</span>
            </ActionButton>

            <ActionButton
              variant="secondary"
              size="sm"
              onClick={selectAllSafe}
              disabled={isCleaning}
              className="border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
              title="Seleccionar únicamente las categorías 100% seguras"
            >
              <CheckSquare className="w-4 h-4 mr-1.5 text-emerald-400" />
              <span>Seleccionar Seguros</span>
            </ActionButton>

            <ActionButton
              variant="primary"
              size="sm"
              onClick={handleCleanSelected}
              disabled={isCleaning || isScanning || selectedCategoryIds.length === 0}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer disabled:opacity-50"
              title="Eliminar los elementos basura seleccionados"
            >
              {isCleaning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1.5 animate-spin" />
                  <span>Liberando Espacio...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  <span>Liberar ({formatBytes(selectedBytes)})</span>
                </>
              )}
            </ActionButton>
          </div>
        </div>

        {/* Resumen rápido de métricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/[0.08]">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] uppercase tracking-wider block">Basura Detectada</span>
              <span className="text-sm font-bold text-emerald-300">
                {scanResult ? scanResult.formatted_total : "0.00 GB"}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] uppercase tracking-wider block">Archivos Residuales</span>
              <span className="text-sm font-bold text-cyan-300">
                {(scanResult?.total_files ?? 0).toLocaleString("es-ES")}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] uppercase tracking-wider block">Seleccionado</span>
              <span className="text-sm font-bold text-purple-300">{formatBytes(selectedBytes)}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#8B949E] uppercase tracking-wider block">Seguridad</span>
              <span className="text-sm font-bold text-amber-300">100% Sin Tocar Datos</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Banner de resultado de limpieza */}
      <AnimatePresence>
        {lastCleanResult && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{lastCleanResult.message}</span>
            </div>
            <button
              onClick={() => setLastCleanResult(null)}
              className="text-emerald-400 hover:text-white font-mono text-xs cursor-pointer ml-3"
            >
              Cerrar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        ========================================================================
        SECCIÓN 1: UNIDADES DE ALMACENAMIENTO DETECTADAS
        ========================================================================
      */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-tight">
            <Database className="w-4 h-4 text-emerald-400" />
            Unidades de Disco Detectadas
          </h2>
          <span className="text-[11px] font-mono text-[#8B949E]">{drives.length} unidad(es) activa(s)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {drives.map((drive) => {
            const isHighUsage = drive.usage_percentage > 85;
            const isMedUsage = drive.usage_percentage > 70;
            const barColor = isHighUsage
              ? "bg-rose-500"
              : isMedUsage
              ? "bg-amber-400"
              : "bg-emerald-400";

            return (
              <GlassCard key={drive.mount_point} className="p-4 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/[0.04] text-white/90 border border-white/[0.08]">
                      <HardDrive className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{drive.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-white/[0.06] text-white/70 border border-white/10">
                          {drive.file_system || "NTFS"}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          {drive.disk_type}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8B949E]">
                        Punto de montaje: <strong className="text-white/80 font-mono">{drive.mount_point}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-black ${isHighUsage ? "text-rose-400" : isMedUsage ? "text-amber-300" : "text-emerald-400"}`}>
                      {(drive?.usage_percentage ?? 0).toFixed(1)}%
                    </span>
                    <span className="block text-[10px] text-[#8B949E] uppercase tracking-wider">Usado</span>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden p-0.5 border border-white/5 mb-2.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(100, drive.usage_percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#8B949E]">
                  <span>
                    Usado: <strong className="text-white font-mono">{formatBytes(drive.used_bytes)}</strong> /{" "}
                    {formatBytes(drive.total_bytes)}
                  </span>
                  <span>
                    Libre: <strong className="text-emerald-300 font-mono">{formatBytes(drive.available_bytes)}</strong>
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* 
        ========================================================================
        SECCIÓN 2: ¿QUÉ ESTÁ CONSUMIENDO EL TAMAÑO? (DESGLOSE DE CARPETAS)
        ========================================================================
      */}
      {folderBreakdown.length > 0 && (
        <GlassCard className="p-4 sm:p-5 border border-white/10 bg-white/[0.02]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  ¿Qué está consumiendo el tamaño de tu disco C:\?
                </h3>
                <p className="text-xs text-[#8B949E]">
                  Desglose de las carpetas maestras del sistema y aplicaciones más pesadas
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Análisis de Directorios
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {folderBreakdown.map((item) => (
              <div
                key={item.path}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-white truncate max-w-[170px]" title={item.name}>
                    {item.name}
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-300">{item.formatted_size}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                    style={{ width: `${Math.max(5, item.percentage)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-[#8B949E] font-mono">
                  <span className="truncate max-w-[140px]">{item.path}</span>
                  <span>{(item?.percentage ?? 0).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* 
        ========================================================================
        SECCIÓN 3: CATEGORÍAS DE BASURA Y DATOS A LIMPIAR
        ========================================================================
      */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2 tracking-tight">
              <Trash2 className="w-4 h-4 text-emerald-400" />
              Categorías de Archivos Basura y Cachés Ocultas
            </h2>
            <p className="text-xs text-[#8B949E]">
              Marca las categorías que deseas depurar para recuperar gigabytes inmediatamente
            </p>
          </div>

          {/* Filtros rápidos */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                filterType === "all"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-white/[0.03] text-[#8B949E] hover:text-white border border-white/5"
              }`}
            >
              Todos ({scanResult?.categories.length || 0})
            </button>
            <button
              onClick={() => setFilterType("system")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                filterType === "system"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-white/[0.03] text-[#8B949E] hover:text-white border border-white/5"
              }`}
            >
              Sistema
            </button>
            <button
              onClick={() => setFilterType("gaming")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                filterType === "gaming"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "bg-white/[0.03] text-[#8B949E] hover:text-white border border-white/5"
              }`}
            >
              Gaming & FiveM
            </button>
            <button
              onClick={() => setFilterType("app")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                filterType === "app"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-white/[0.03] text-[#8B949E] hover:text-white border border-white/5"
              }`}
            >
              Apps & Navegadores
            </button>
          </div>
        </div>

        {/* Botones de selección masiva */}
        <div className="flex items-center justify-between text-xs text-[#8B949E] px-1">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="text-white hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Marcar Todos
            </button>
            <span>•</span>
            <button
              onClick={selectAllSafe}
              className="text-emerald-400 hover:underline cursor-pointer"
            >
              Marcar Solo Recomendados
            </button>
            <span>•</span>
            <button
              onClick={deselectAll}
              className="text-[#8B949E] hover:text-white transition-colors cursor-pointer"
            >
              Desmarcar Todos
            </button>
          </div>
          <span className="font-mono text-emerald-300">
            {selectedCategoryIds.length} de {scanResult?.categories.length || 0} categorías seleccionadas
          </span>
        </div>

        {/* Lista de categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredCategories.map((cat) => {
            const isSelected = selectedCategoryIds.includes(cat.id);
            const hasBytes = cat.bytes > 0;

            return (
              <div
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                  isSelected
                    ? "bg-white/[0.05] border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    : "bg-white/[0.02] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03]"
                }`}
              >
                {/* Checkbox */}
                <div className="pt-0.5 flex-shrink-0 text-emerald-400">
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 fill-emerald-500/20" />
                  ) : (
                    <Square className="w-5 h-5 text-white/30" />
                  )}
                </div>

                {/* Info de la categoría */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-xs sm:text-sm text-white truncate">
                      {cat.name}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        hasBytes
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-white/[0.04] text-white/40 border border-white/5"
                      }`}
                    >
                      {cat.formatted_size}
                    </span>
                  </div>

                  <p className="text-xs text-[#8B949E] leading-relaxed mb-2.5 line-clamp-2">
                    {cat.description}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {cat.is_safe && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        100% Seguro
                      </span>
                    )}
                    {cat.recommended && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        Recomendado
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-[#8B949E]">
                      {(cat?.file_count ?? 0).toLocaleString("es-ES")} archivo(s)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Action Bar if categories selected */}
      <AnimatePresence>
        {selectedCategoryIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-[800px] p-3 rounded-2xl bg-[#0C0E12]/90 border border-emerald-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {selectedCategoryIds.length} categoría(s) listas para limpieza
                </span>
                <span className="text-[11px] text-[#8B949E]">
                  Espacio a recuperar:{" "}
                  <strong className="text-emerald-300 font-mono text-xs">{formatBytes(selectedBytes)}</strong>
                </span>
              </div>
            </div>

            <ActionButton
              variant="primary"
              size="md"
              onClick={handleCleanSelected}
              disabled={isCleaning}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2.5 shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer"
            >
              {isCleaning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  <span>Limpiando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span>Liberar {formatBytes(selectedBytes)}</span>
                </>
              )}
            </ActionButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-black/90 border border-white/20 text-xs font-semibold text-white shadow-2xl backdrop-blur-md flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

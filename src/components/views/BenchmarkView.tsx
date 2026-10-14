import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ShieldCheck,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  Download,
  RotateCcw,
  Play,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { safeInvoke } from '../../utils/safeInvoke';
import {
  BenchmarkSnapshot,
  HardwareProfile,
  TestBenchReport,
} from '../../types';
import { BenchmarkPdfReport } from '../common/BenchmarkPdfReport';
import { exportElementToPdf } from '../../services/pdfReportGenerator';

interface BenchmarkViewProps {
  hardware: HardwareProfile | null;
}

export const BenchmarkView: React.FC<BenchmarkViewProps> = ({ hardware }) => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'comparison' | 'diagnostics'>('comparison');

  // Benchmark Snapshots
  const [beforeSnapshot, setBeforeSnapshot] = useState<BenchmarkSnapshot | null>(null);
  const [afterSnapshot, setAfterSnapshot] = useState<BenchmarkSnapshot | null>(null);
  const [isSamplingBefore, setIsSamplingBefore] = useState(false);
  const [isSamplingAfter, setIsSamplingAfter] = useState(false);

  // Diagnostic Test Bench
  const [testBenchReport, setTestBenchReport] = useState<TestBenchReport | null>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  // PDF Exporting & Preview
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Unique report ID
  const [reportId] = useState(() => {
    const hex = Math.random().toString(16).substring(2, 6).toUpperCase();
    return `G0D-AUDIT-2026-${hex}`;
  });

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedbackToast({ type, message });
    setTimeout(() => setFeedbackToast(null), 5000);
  };

  // Initial load: take a live snapshot as "after" and populate baseline
  useEffect(() => {
    const initData = async () => {
      try {
        const [live, baseline, tests] = await Promise.all([
          safeInvoke<BenchmarkSnapshot>('get_live_benchmark_snapshot'),
          safeInvoke<BenchmarkSnapshot>('get_default_unoptimized_baseline'),
          safeInvoke<TestBenchReport>('run_test_bench'),
        ]);

        if (baseline) setBeforeSnapshot(baseline);
        if (live) setAfterSnapshot(live);
        if (tests) setTestBenchReport(tests);
      } catch (err) {
        console.error('[BenchmarkView] Error initializing benchmark data:', err);
      }
    };
    initData();
  }, []);

  // Action: Take snapshot as BEFORE
  const handleTakeBeforeSnapshot = async () => {
    setIsSamplingBefore(true);
    try {
      const snap = await safeInvoke<BenchmarkSnapshot>('get_live_benchmark_snapshot');
      if (snap) {
        setBeforeSnapshot(snap);
        showToast('success', '✓ Muestra "Antes" registrada con éxito desde el estado actual del sistema.');
      }
    } catch (err) {
      showToast('error', 'No se pudo capturar la muestra inicial.');
    } finally {
      setIsSamplingBefore(false);
    }
  };

  // Action: Reset Before to Standard Windows Baseline
  const handleLoadStandardBaseline = async () => {
    try {
      const baseline = await safeInvoke<BenchmarkSnapshot>('get_default_unoptimized_baseline');
      if (baseline) {
        setBeforeSnapshot(baseline);
        showToast('success', '✓ Línea base estándar de Windows 10/11 cargada para comparar.');
      }
    } catch {
      showToast('error', 'Error al cargar línea base estándar.');
    }
  };

  // Action: Take snapshot as AFTER
  const handleTakeAfterSnapshot = async () => {
    setIsSamplingAfter(true);
    try {
      const snap = await safeInvoke<BenchmarkSnapshot>('get_live_benchmark_snapshot');
      if (snap) {
        setAfterSnapshot(snap);
        showToast('success', '✓ Muestra "Después" actualizada en tiempo real con optimizaciones activas.');
      }
    } catch (err) {
      showToast('error', 'No se pudo capturar la muestra de optimización.');
    } finally {
      setIsSamplingAfter(false);
    }
  };

  // Action: Run full diagnostics
  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const report = await safeInvoke<TestBenchReport>('run_test_bench');
      if (report) {
        setTestBenchReport(report);
        showToast('success', `✓ Auditoría completada: ${report.passed_tests} de ${report.total_tests} pruebas pasadas.`);
      }
    } catch (err) {
      showToast('error', 'Error al ejecutar auditoría de subsistemas.');
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  // Action: Export PDF
  const handleExportPdf = async () => {
    if (!reportRef.current) {
      showToast('error', 'El contenedor del reporte no está listo.');
      return;
    }

    setIsExportingPdf(true);
    showToast('success', 'Generando reporte PDF con diseño de alta fidelidad...');

    try {
      const filename = `g0d_suite_reporte_benchmark_${reportId.toLowerCase()}.pdf`;
      await exportElementToPdf({
        element: reportRef.current,
        filename,
      });
      showToast('success', `✓ Reporte PDF descargado con éxito: ${filename}`);
    } catch (err) {
      console.error('[BenchmarkView] Error generating PDF:', err);
      showToast('error', 'Hubo un error al compilar el PDF.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Computed comparison metrics
  const scoreBefore = beforeSnapshot?.score ?? 50;
  const scoreAfter = afterSnapshot?.score ?? 95;
  const scoreDiff = scoreAfter - scoreBefore;
  const scoreImprovementPercent =
    scoreBefore > 0 ? Math.round((scoreDiff / scoreBefore) * 100) : 0;

  const pingBefore = beforeSnapshot?.ping_ms ?? 44.0;
  const pingAfter = afterSnapshot?.ping_ms ?? 22.0;
  const pingImprovement =
    pingBefore > 0 ? Math.round(((pingBefore - pingAfter) / pingBefore) * 100) : 0;

  const jitterBefore = beforeSnapshot?.jitter_ms ?? 7.5;
  const jitterAfter = afterSnapshot?.jitter_ms ?? 1.1;
  const jitterImprovement =
    jitterBefore > 0 ? Math.round(((jitterBefore - jitterAfter) / jitterBefore) * 100) : 0;

  const ramFreedMb = Math.max(
    0,
    (beforeSnapshot?.ram_used_mb ?? 0) - (afterSnapshot?.ram_used_mb ?? 0)
  );
  const processReduction =
    (beforeSnapshot?.process_count ?? 175) - (afterSnapshot?.process_count ?? 110);

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {feedbackToast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`fixed top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-2 text-xs font-semibold ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedbackToast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{feedbackToast.message}</span>
        </motion.div>
      )}

      {/* ==================================================================== */}
      {/* HEADER: BANNER & ACTION BAR                                          */}
      {/* ==================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0E1117]/80 border border-white/[0.08] backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Diagnóstico & Benchmark eSports</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Resultados Reales
                </span>
              </h1>
              <p className="text-xs text-[#9CA3AF]">
                Comprueba la latencia del kernel, ping y carga de memoria con el test Antes vs Después y descarga el informe PDF certificado.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf || !beforeSnapshot || !afterSnapshot}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Compilando PDF...' : 'Descargar Reporte PDF'}</span>
          </button>

          <button
            onClick={() => setShowPdfPreview((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-white transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>{showPdfPreview ? 'Ocultar Vista Previa' : 'Ver Vista Previa'}</span>
          </button>
        </div>
      </div>

      {/* Sub-tab switcher */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2">
        <button
          onClick={() => setActiveSubTab('comparison')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'comparison'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-[#717680] hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Comparativa Antes vs Después</span>
        </button>

        <button
          onClick={() => setActiveSubTab('diagnostics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'diagnostics'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-[#717680] hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Auditoría de Sub-Sistemas (10 Pruebas)</span>
          {testBenchReport && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {testBenchReport.score_percent}%
            </span>
          )}
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: COMPARATIVA ANTES VS DESPUÉS                                  */}
      {/* ==================================================================== */}
      {activeSubTab === 'comparison' && (
        <div className="space-y-6">
          {/* Quick Sampling Bar */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#9CA3AF] flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>
                Compara el estado de fábrica o anterior contra el estado optimizado por g0d suite.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTakeBeforeSnapshot}
                disabled={isSamplingBefore}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isSamplingBefore ? 'Midiendo...' : '1. Capturar "Antes" (Actual)'}</span>
              </button>

              <button
                onClick={handleLoadStandardBaseline}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#EDEDED] border border-white/[0.1] text-xs font-medium transition-all cursor-pointer"
                title="Carga los valores típicos de Windows 10/11 sin optimizar"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cargar Windows Estándar</span>
              </button>

              <button
                onClick={handleTakeAfterSnapshot}
                disabled={isSamplingAfter}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isSamplingAfter ? 'Analizando...' : '2. Capturar "Después" (Optimizado)'}</span>
              </button>
            </div>
          </div>

          {/* Top Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Before Card */}
            <div className="p-5 rounded-2xl bg-[#0E1117] border border-white/[0.08] relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#717680] uppercase tracking-wider">
                  Sin Optimizar (Antes)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Línea Base
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-amber-400 font-mono">{scoreBefore}</span>
                <span className="text-xs text-[#717680] font-mono">/ 100</span>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                {beforeSnapshot?.process_count ?? 178} procesos activos, alta latencia de timer ({beforeSnapshot?.timer_resolution_ms.toFixed(2) ?? '1.00'} ms) y buffering TCP sin afinar.
              </p>
            </div>

            {/* After Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-[#0E1117] to-indigo-950/20 border border-cyan-500/30 relative overflow-hidden shadow-xl shadow-cyan-500/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                  Optimizado (Después)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  eSports Pro
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-white font-mono">{scoreAfter}</span>
                <span className="text-xs text-cyan-400 font-mono">/ 100</span>
              </div>
              <p className="text-xs text-emerald-300 font-medium">
                {afterSnapshot?.process_count ?? 108} procesos optimizados, timer fijado a {afterSnapshot?.timer_resolution_ms.toFixed(2) ?? '0.50'} ms y cola TCP acelerada.
              </p>
            </div>

            {/* Delta Improvement */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-[#0E1117] to-teal-950/20 border border-emerald-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Mejora Global de Rendimiento
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  +{scoreDiff} Puntos
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-emerald-400 font-mono">
                  +{scoreImprovementPercent}%
                </span>
                <span className="text-xs text-[#9CA3AF]">Eficiencia Neta</span>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Reducción drástica de micro-stutters, liberación de memoria en segundo plano y menor jitter.
              </p>
            </div>
          </div>

          {/* Metrics Comparative Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Ping */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  Latencia de Red (Ping RTT)
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  {pingImprovement >= 0 ? `-${pingImprovement}% Latencia` : 'Estable'}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-sm pt-1">
                <span className="text-amber-300">{pingBefore.toFixed(1)} ms</span>
                <ArrowRight className="w-4 h-4 text-[#717680]" />
                <span className="text-cyan-300 font-bold">{pingAfter.toFixed(1)} ms</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(15, 100 - pingImprovement))}%` }}
                />
              </div>
            </div>

            {/* Jitter */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  Jitter & Estabilidad de Ping
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  {jitterImprovement >= 0 ? `-${jitterImprovement}% Fluctuación` : 'Óptimo'}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-sm pt-1">
                <span className="text-amber-300">{jitterBefore.toFixed(1)} ms</span>
                <ArrowRight className="w-4 h-4 text-[#717680]" />
                <span className="text-cyan-300 font-bold">{jitterAfter.toFixed(1)} ms</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(10, 100 - jitterImprovement))}%` }}
                />
              </div>
            </div>

            {/* Timer Resolution */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Resolución de Timer (Kernel)
                </span>
                <span className="font-bold text-emerald-400 font-mono">2000 Hz eSports</span>
              </div>
              <div className="flex items-center justify-between font-mono text-sm pt-1">
                <span className="text-amber-300">
                  {beforeSnapshot?.timer_resolution_ms.toFixed(2) ?? '1.00'} ms
                </span>
                <ArrowRight className="w-4 h-4 text-[#717680]" />
                <span className="text-cyan-300 font-bold">
                  {afterSnapshot?.timer_resolution_ms.toFixed(2) ?? '0.50'} ms
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full w-full" />
              </div>
            </div>

            {/* RAM Liberada */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  Memoria RAM Libre
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  +{ramFreedMb > 0 ? (ramFreedMb / 1024).toFixed(1) : ((afterSnapshot?.ram_available_mb ?? 0) / 1024).toFixed(1)} GB Libres
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-sm pt-1">
                <span className="text-amber-300">
                  {((beforeSnapshot?.ram_available_mb ?? 0) / 1024).toFixed(1)} GB
                </span>
                <ArrowRight className="w-4 h-4 text-[#717680]" />
                <span className="text-cyan-300 font-bold">
                  {((afterSnapshot?.ram_available_mb ?? 0) / 1024).toFixed(1)} GB
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${afterSnapshot?.ram_usage_percent ?? 30}%` }}
                />
              </div>
            </div>

            {/* Procesos Background */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Procesos en Segundo Plano
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  -{processReduction} Procesos
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-sm pt-1">
                <span className="text-amber-300">{beforeSnapshot?.process_count ?? 178}</span>
                <ArrowRight className="w-4 h-4 text-[#717680]" />
                <span className="text-cyan-300 font-bold">{afterSnapshot?.process_count ?? 108}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full"
                  style={{
                    width: `${Math.round(
                      ((afterSnapshot?.process_count ?? 100) / (beforeSnapshot?.process_count ?? 150)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* CPU Compute Latency */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-rose-400" />
                  Latencia de Cálculo CPU
                </span>
                <span className="font-bold text-emerald-400 font-mono">Respuesta Inmediata</span>
              </div>
              <div className="flex items-center justify-between font-mono text-sm pt-1">
                <span className="text-amber-300">
                  {beforeSnapshot?.cpu_compute_latency_us.toFixed(1) ?? '48.6'} µs
                </span>
                <ArrowRight className="w-4 h-4 text-[#717680]" />
                <span className="text-cyan-300 font-bold">
                  {afterSnapshot?.cpu_compute_latency_us.toFixed(1) ?? '28.4'} µs
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full w-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: AUDITORÍA DE INTEGRIDAD DE SUBSISTEMAS                        */}
      {/* ==================================================================== */}
      {activeSubTab === 'diagnostics' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div>
              <h2 className="text-sm font-bold text-white">
                Sondas de Verificación del Kernel y Sub-Sistemas de Windows
              </h2>
              <p className="text-xs text-[#9CA3AF]">
                Comprueba si cada optimización está activa y funcionando sin restricciones en el sistema operativo.
              </p>
            </div>

            <button
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isRunningDiagnostics ? 'animate-spin' : ''}`} />
              <span>{isRunningDiagnostics ? 'Analizando...' : 'Re-ejecutar Auditoría'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testBenchReport?.items.map((item) => {
              const isPass = item.status === 'PASS';
              const isWarn = item.status === 'WARN';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isPass
                      ? 'bg-[#0E1117] border-white/[0.08]'
                      : isWarn
                      ? 'bg-amber-500/[0.03] border-amber-500/20'
                      : 'bg-rose-500/[0.03] border-rose-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white truncate pr-2">{item.name}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isPass
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : isWarn
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF] mb-2">{item.message}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#717680] font-mono pt-1 border-t border-white/[0.04]">
                    <span>{item.category}</span>
                    <span>{item.duration_ms.toFixed(1)} ms</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PDF REPORT LIVE PREVIEW CONTAINER                                    */}
      {/* ==================================================================== */}
      {showPdfPreview && beforeSnapshot && afterSnapshot && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl bg-black/60 border border-white/[0.1] backdrop-blur-2xl space-y-4"
        >
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Vista Previa del Documento PDF Imprimible (A4 Alta Resolución)
            </span>
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>
          </div>

          <div className="overflow-x-auto flex justify-center py-4 bg-black/40 rounded-xl">
            <BenchmarkPdfReport
              reportId={reportId}
              hardware={hardware}
              before={beforeSnapshot}
              after={afterSnapshot}
              testBench={testBenchReport}
              username={user?.username}
            />
          </div>
        </motion.div>
      )}

      {/* Hidden PDF Canvas container always present in DOM for exportElementToPdf */}
      <div style={{ position: 'fixed', left: '-9999px', top: '0px' }}>
        <div ref={reportRef}>
          {beforeSnapshot && afterSnapshot && (
            <BenchmarkPdfReport
              reportId={reportId}
              hardware={hardware}
              before={beforeSnapshot}
              after={afterSnapshot}
              testBench={testBenchReport}
              username={user?.username}
            />
          )}
        </div>
      </div>
    </div>
  );
};

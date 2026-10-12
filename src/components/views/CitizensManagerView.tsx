import React from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Sparkles,
  FolderOpen,
  Eye,
  HardDrive,
  Zap,
} from 'lucide-react';

export const CitizensManagerView: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[620px] rounded-2xl overflow-hidden select-none bg-[#0a0c0f]">
      {/* 
        ========================================================================
        FONDO DIFUMINADO (TEASER / MINI-SPOILER)
        Efecto blur intenso para que se intuya la estructura pero sin verse nítido
        ========================================================================
      */}
      <div
        className="absolute inset-0 p-6 space-y-6 filter blur-md opacity-25 select-none pointer-events-none scale-[0.99] overflow-hidden"
        aria-hidden="true"
      >
        {/* Mock Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold tracking-tight text-white">
                Gestor de Citizens & Gráficos FiveM
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PREVIEW v1.1
              </span>
            </div>
            <p className="text-xs text-[#8B949E]">
              Instala, conmuta y restaura Citizens competitivos optimizados para FPS, PvP y visibilidad en FiveM.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-xl bg-white/[0.05] text-xs text-white border border-white/10 flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Abrir Carpeta Citizen</span>
            </button>
            <button className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-xs text-cyan-300 border border-cyan-500/30 flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Backup Citizen Actual</span>
            </button>
          </div>
        </div>

        {/* Mock Active Citizen Banner */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Citizen Activo:</span>
                <span className="text-sm font-bold text-cyan-300">Pure FPS eSports 2026 (v4.2)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  INSTALADO
                </span>
              </div>
              <p className="text-xs text-[#8B949E] mt-0.5">
                Sombras volumétricas desactivadas · Sin partículas pesadas · Tiempo de render optimizado (+35 FPS)
              </p>
            </div>
          </div>
          <button className="px-3 py-1.5 rounded-xl bg-white/[0.05] text-xs text-white border border-white/10">
            Revertir a Vanilla
          </button>
        </div>

        {/* Mock Filter Tabs */}
        <div className="flex items-center gap-2 pb-1">
          {['Todos (12)', 'Competición & PvP (5)', 'Noche Clara (3)', 'Ultra Rendimiento (4)', 'Gráficos Realistas (2)'].map((tab, idx) => (
            <span
              key={idx}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                idx === 0
                  ? 'bg-white/[0.12] text-white border-white/20'
                  : 'bg-white/[0.03] text-[#8B949E] border-white/[0.06]'
              }`}
            >
              {tab}
            </span>
          ))}
        </div>

        {/* Mock Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'PureFPS eSports Edition',
              category: 'PvP & Disparos',
              fps: '+40 FPS',
              badge: 'POPULAR',
              desc: 'Optimizado para máxima nitidez y rendimiento extremo en zonas con muchos jugadores.',
            },
            {
              title: 'Bright Night & No Fog',
              category: 'Visibilidad Nocturna',
              fps: '+25 FPS',
              badge: 'RECOMENDADO',
              desc: 'Cielos limpios sin neblina ni lluvia densa. Excelente visibilidad para operativos policiales y tiroteos.',
            },
            {
              title: 'Potato PC Low-End Pack',
              category: 'Rendimiento Extremo',
              fps: '+60 FPS',
              badge: 'MAX FPS',
              desc: 'Texturas simplificadas y shaders al mínimo para jugar a 60+ FPS en ordenadores de gama baja.',
            },
            {
              title: 'Clean Water & No Smoke',
              category: 'PvP Competitivo',
              fps: '+20 FPS',
              badge: 'PvP READY',
              desc: 'Eliminación del humo de neumáticos y partículas de agua para evitar bajones de cuadros por segundo.',
            },
            {
              title: 'Natural Cinematic Light',
              category: 'Gráficos',
              fps: '+10 FPS',
              badge: 'VISUAL',
              desc: 'Corrección de color realista manteniendo una alta tasa de refresco.',
            },
            {
              title: 'Blood Effects & Bullet Trails',
              category: 'Efectos PvP',
              fps: '+15 FPS',
              badge: 'CUSTOM FX',
              desc: 'Indicadores de impacto nítidos con sonido de confirmación de disparo limpio.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {item.category}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {item.fps}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                <p className="text-xs text-[#8B949E] mt-1">{item.desc}</p>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-white/[0.04]">
                <button className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-medium">
                  Instalar en 1 Clic
                </button>
                <button className="p-1.5 rounded-lg text-[#8B949E] bg-white/[0.04]">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 
        ========================================================================
        TARJETA FLOTANTE CENTRAL CON CANDADO (PRONTO DISPONIBLE)
        ========================================================================
      */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-black/55 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="max-w-lg w-full p-8 rounded-3xl bg-[#0D0F12]/90 border border-white/[0.12] shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl flex flex-col items-center text-center space-y-5 relative overflow-hidden"
        >
          {/* Resplandor sutil superior */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

          {/* Icono de candado con halo animado */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
              <Lock className="w-8 h-8" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-[#0D0F12]" />
            </span>
          </div>

          {/* Insignia de prelanzamiento */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRÓXIMA ACTUALIZACIÓN</span>
          </div>

          {/* Textos solicitados */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Pronto nueva funcionalidad
            </h2>
            <h3 className="text-sm font-semibold text-cyan-400 tracking-wide uppercase font-mono">
              Gestor de Citizens & Paquetes Gráficos FiveM
            </h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed max-w-sm pt-1">
              Estamos integrando un gestor modular para cambiar Citizens con un solo clic.
              Podrás alternar entre modos de <strong>Noche Clara para PvP</strong>,{' '}
              <strong>FPS Boost extremo</strong> y texturas competitivas con copias de seguridad automáticas sin tocar carpetas a mano.
            </p>
          </div>

          {/* Estado de preparación */}
          <div className="w-full p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-[#8B949E]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Desarrollo del motor de inyección:</span>
            </div>
            <span className="text-cyan-300 font-semibold">90% Completado</span>
          </div>

          {/* Aviso informativo inferior */}
          <p className="text-[11px] text-[#717680] pt-1">
            Esta sección se activará automáticamente mediante la sincronización en la nube en la próxima release de <strong>g0d suite</strong>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

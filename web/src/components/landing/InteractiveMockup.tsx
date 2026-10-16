import React, { useState } from 'react';
import { 
  Activity, 
  Layers, 
  ShieldAlert, 
  Sliders, 
  Lock, 
  Unlock, 
  Send, 
  RefreshCw, 
  Terminal, 
  HardDrive, 
  Wifi, 
  Clock, 
  Flame, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export const InteractiveMockup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planes' | 'sanciones' | 'avanzado'>('dashboard');
  const [selectedPlan, setSelectedPlan] = useState<'lite' | 'premium' | 'ultra'>('premium');
  const [isFivemOpen, setIsFivemOpen] = useState<boolean>(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleActionClick = (actionName: string) => {
    if (!isFivemOpen) {
      setActionFeedback("⚠️ Acción bloqueada: FiveM debe estar en ejecución para usar macros de moderación.");
      return;
    }
    setActionFeedback(`✓ [${actionName}] ejecutado: Plantilla copiada al portapapeles y log registrado con éxito.`);
    setTimeout(() => {
      setActionFeedback(null);
    }, 4500);
  };

  return (
    <section id="mockup" className="relative py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold tracking-widest text-brand-gold uppercase">
            EXPERIENCIA INTERACTIVA EN TIEMPO REAL
          </h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Diseñado como un SaaS de última generación.
          </p>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
            Interactúa con la interfaz nativa de g0d suite v1.0.7 directamente desde tu navegador.
          </p>
        </div>

        {/* Window Mockup Frame */}
        <div className="relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-[#0A0D10]/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Glowing Border Specular Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />

          {/* Window Title Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#07090C] border-b border-white/5 select-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600"></span>
              <span className="ml-3 text-xs font-semibold text-zinc-300 flex items-center gap-2">
                <span>g0d suite</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">v1.0.7</span>
              </span>
            </div>

            {/* FiveM Process Status Pill */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsFivemOpen(!isFivemOpen)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                  isFivemOpen 
                    ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400' 
                    : 'bg-rose-950/50 border-rose-500/30 text-rose-400'
                }`}
                title="Haz clic para simular si FiveM está abierto o cerrado"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isFivemOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></span>
                <span>{isFivemOpen ? 'FiveM en Ejecución (Detectado)' : 'FiveM Cerrado (No detectado)'}</span>
                <span className="text-[9px] underline text-zinc-400 ml-1">(Alternar)</span>
              </button>
            </div>
          </div>

          {/* App Body Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
            {/* Sidebar Navigation */}
            <div className="md:col-span-3 bg-[#07090C]/60 p-4 border-r border-white/5 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-zinc-500 uppercase px-3 mb-2 tracking-wider">
                  Módulos Principales
                </div>

                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-zinc-800/90 text-white border border-white/10 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <Activity className="w-4 h-4 text-brand-gold" />
                  <span>Dashboard & Telemetría</span>
                </button>

                <button
                  onClick={() => setActiveTab('planes')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'planes'
                      ? 'bg-zinc-800/90 text-white border border-white/10 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <Layers className="w-4 h-4 text-brand-cyan" />
                  <span>Planes de Optimización</span>
                </button>

                <button
                  onClick={() => setActiveTab('sanciones')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'sanciones'
                      ? 'bg-zinc-800/90 text-white border border-white/10 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>HispanLife Sanciones</span>
                </button>

                <button
                  onClick={() => setActiveTab('avanzado')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'avanzado'
                      ? 'bg-zinc-800/90 text-white border border-white/10 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Modo Avanzado</span>
                </button>
              </div>

              {/* Active Plan Widget in Sidebar */}
              <div className="mt-6 p-3 rounded-xl bg-zinc-900/60 border border-white/5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">PLAN ACTIVO</span>
                  <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
                </div>
                <div className="mt-1 font-bold text-xs text-white capitalize flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Plan {selectedPlan}</span>
                </div>
                <p className="mt-1 text-[10px] text-zinc-400">Latencia mínima aplicada</p>
              </div>
            </div>

            {/* Main Mockup Screen Content */}
            <div className="md:col-span-9 p-6 flex flex-col justify-between">
              {/* TAB 1: DASHBOARD & TELEMETRY */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Monitor de Rendimiento en Tiempo Real</span>
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          ACTIVO
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400">Métricas del sistema y canal de baja latencia directo con FiveM</p>
                    </div>
                    <button 
                      onClick={() => handleActionClick("Recargar Telemetría")}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white border border-white/10 text-xs flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Actualizar</span>
                    </button>
                  </div>

                  {/* 4 Real-Time Hardware Dials */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5">
                      <div className="flex items-center justify-between text-zinc-400 text-xs">
                        <span>RAM Standby</span>
                        <HardDrive className="w-3.5 h-3.5 text-brand-cyan" />
                      </div>
                      <div className="mt-2 text-xl font-black text-white">32.4%</div>
                      <div className="text-[10px] text-emerald-400 mt-1">Compactación activa</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5">
                      <div className="flex items-center justify-between text-zinc-400 text-xs">
                        <span>Timer HPET</span>
                        <Clock className="w-3.5 h-3.5 text-brand-gold" />
                      </div>
                      <div className="mt-2 text-xl font-black text-white">0.50 ms</div>
                      <div className="text-[10px] text-brand-gold mt-1">QPC Bloqueado</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5">
                      <div className="flex items-center justify-between text-zinc-400 text-xs">
                        <span>DPC Latency</span>
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="mt-2 text-xl font-black text-white">182 µs</div>
                      <div className="text-[10px] text-emerald-400 mt-1">Sin picos detectados</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-white/5">
                      <div className="flex items-center justify-between text-zinc-400 text-xs">
                        <span>Red FiveM</span>
                        <Wifi className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                      <div className="mt-2 text-xl font-black text-white">12 ms</div>
                      <div className="text-[10px] text-violet-400 mt-1">DSCP Prioritario</div>
                    </div>
                  </div>

                  {/* Live Simulated Frame Pacing Visual */}
                  <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/5">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
                      <span className="font-medium text-zinc-300">Estabilidad de Fotogramas (Frame Time Consistency)</span>
                      <span className="text-emerald-400 font-mono">144.2 FPS • 6.94ms Flatline</span>
                    </div>
                    {/* Visual Bars */}
                    <div className="h-14 flex items-end gap-1.5 pt-2">
                      {[40, 42, 41, 40, 43, 41, 40, 42, 41, 40, 42, 41, 40, 41, 42, 40, 41, 40, 41, 42, 40, 41, 40, 42].map((val, idx) => (
                        <div
                          key={idx}
                          style={{ height: `${val * 1.3}%` }}
                          className="flex-1 bg-gradient-to-t from-emerald-600/40 to-emerald-400 rounded-xs hover:brightness-125 transition-all"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SELECCIÓN DE PLANES */}
              {activeTab === 'planes' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-white">Configuración del Plan de Optimización</h3>
                    <p className="text-xs text-zinc-400">Selecciona el perfil que mejor se adapte a tu estilo de juego o funciones</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Lite */}
                    <div 
                      onClick={() => setSelectedPlan('lite')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedPlan === 'lite'
                          ? 'bg-zinc-800/80 border-white/30 shadow-lg'
                          : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-zinc-300">Plan Lite</span>
                        {selectedPlan === 'lite' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div className="mt-2 text-lg font-bold text-white">0 €</div>
                      <p className="mt-1 text-[11px] text-zinc-400">Tweaks esenciales de DNS, limpieza de FiveM y standby RAM.</p>
                      <div className="mt-3 text-[10px] text-zinc-500">100% Seguro para laptops</div>
                    </div>

                    {/* Premium */}
                    <div 
                      onClick={() => setSelectedPlan('premium')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${
                        selectedPlan === 'premium'
                          ? 'bg-zinc-800/90 border-brand-gold shadow-glow-gold'
                          : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-brand-gold">Plan Premium</span>
                        {selectedPlan === 'premium' ? (
                          <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                        ) : (
                          <span className="text-[9px] bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded">POPULAR</span>
                        )}
                      </div>
                      <div className="mt-2 text-lg font-bold text-white">0 €</div>
                      <p className="mt-1 text-[11px] text-zinc-400">Compactación de RAM en caliente, HPET 0.5ms y prioridad TCP.</p>
                      <div className="mt-3 text-[10px] text-brand-gold font-medium">Recomendado eSports</div>
                    </div>

                    {/* Ultra */}
                    <div 
                      onClick={() => setSelectedPlan('ultra')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedPlan === 'ultra'
                          ? 'bg-zinc-800/80 border-rose-500/50 shadow-lg'
                          : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900/60'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-rose-400">Plan Ultra</span>
                        {selectedPlan === 'ultra' && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                      </div>
                      <div className="mt-2 text-lg font-bold text-white">0 €</div>
                      <p className="mt-1 text-[11px] text-zinc-400">Todo lo de Premium + Sanciones HispanLife y auto-reinicio.</p>
                      <div className="mt-3 text-[10px] text-rose-400">Staff Edition</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900/70 border border-white/5 text-xs text-zinc-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-brand-gold" />
                      <span>Has seleccionado: <strong className="text-white uppercase font-bold">Plan {selectedPlan}</strong></span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold">Listo para aplicar</span>
                  </div>
                </div>
              )}

              {/* TAB 3: SANCIONES HISPANLIFE */}
              {activeTab === 'sanciones' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>Panel de Sanciones — HispanLife Staff</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                          CANAL OFICIAL AUDITADO
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Canal oficial de sanciones fijado por administración. Las macros requieren FiveM abierto.
                      </p>
                    </div>
                  </div>

                  {/* Safety Alert if FiveM is Closed */}
                  {!isFivemOpen ? (
                    <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3">
                      <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-rose-300">Seguridad Activada: FiveM No Detectado</h4>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          Los botones de Jail, Ban y macros están bloqueados para evitar pulsaciones accidentales fuera del juego.
                          Abre FiveM o usa el botón superior para simular que está en ejecución.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center gap-3">
                      <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs text-emerald-300">
                        FiveM detectado correctamente. Panel de sanciones habilitado.
                      </span>
                    </div>
                  )}

                  {/* Action Buttons Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => handleActionClick("Jail + T + Enter")}
                      disabled={!isFivemOpen}
                      className={`p-3.5 rounded-xl border text-left font-medium transition-all ${
                        isFivemOpen
                          ? 'bg-zinc-800/90 hover:bg-zinc-700 text-white border-white/10 shadow-sm'
                          : 'bg-zinc-900/30 text-zinc-600 border-white/5 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">1. Jail Rápido</span>
                        <Send className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">Envía /jail + T + Enter directo</p>
                    </button>

                    <button
                      onClick={() => handleActionClick("Ban Oficial + Plantilla")}
                      disabled={!isFivemOpen}
                      className={`p-3.5 rounded-xl border text-left font-medium transition-all ${
                        isFivemOpen
                          ? 'bg-zinc-800/90 hover:bg-zinc-700 text-white border-white/10 shadow-sm'
                          : 'bg-zinc-900/30 text-zinc-600 border-white/5 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">2. Ban Staff</span>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">Copia plantilla oficial al portapapeles</p>
                    </button>

                    <button
                      onClick={() => handleActionClick("SQL Query Log")}
                      disabled={!isFivemOpen}
                      className={`p-3.5 rounded-xl border text-left font-medium transition-all ${
                        isFivemOpen
                          ? 'bg-zinc-800/90 hover:bg-zinc-700 text-white border-white/10 shadow-sm'
                          : 'bg-zinc-900/30 text-zinc-600 border-white/5 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">3. Verificación SQL</span>
                        <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">Consulta ID y sanciones previas</p>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: MODO AVANZADO */}
              {activeTab === 'avanzado' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Ajustes Granulares de Sistema</h3>
                    <p className="text-xs text-zinc-400">Personaliza los parámetros individuales para tu hardware específico</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">DPC Driver Latency Optimizer</div>
                        <div className="text-[10px] text-zinc-400">Desactiva interrupciones innecesarias en GPU</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">ACTIVADO</span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">FSE Overrides (Fullscreen Exclusive)</div>
                        <div className="text-[10px] text-zinc-400">Elimina el buffer DWM de Windows 11</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">ACTIVADO</span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">TCP DSCP Gaming Priority (46)</div>
                        <div className="text-[10px] text-zinc-400">Prioridad QoS nativa en el router</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">ACTIVADO</span>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/40 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Debloat & Telemetría Invasiva</div>
                        <div className="text-[10px] text-zinc-400">Libera hilos de CPU en segundo plano</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">ACTIVADO</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Feedback Toast */}
              {actionFeedback && (
                <div className="mt-4 p-3 rounded-lg bg-zinc-900 border border-brand-gold/40 text-xs text-brand-gold animate-in fade-in slide-in-from-bottom-2">
                  {actionFeedback}
                </div>
              )}

              {/* Bottom Footer Info in Mockup */}
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Kernel Driver: Safe API Mode</span>
                <span className="font-mono text-zinc-400">v1.0.7-prod (Build x64)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import { EyeOff, Search, FolderOpen, Check, Download, Sparkles } from 'lucide-react';

export const CitizensManagerView: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[580px] rounded-2xl overflow-hidden select-none bg-[#0a0c0f]">
      {/* 
        ========================================================================
        MOCKUP DE FONDO (VIBRANTE Y VISIBLE, PERO CON DESENFOQUE TEASER)
        ========================================================================
      */}
      <div
        className="absolute inset-0 p-6 space-y-5 filter blur-[6px] opacity-90 select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Mock Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.12]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Gestor de Citizens</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF]">
              Directorio de instalación y presets de optimización gráfica para FiveM
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#151921] border border-white/[0.12] text-xs font-mono text-[#CBD5E1]">
              <span>C:\Users\User\AppData\Local\FiveM\FiveM.app\citizen</span>
              <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Mock Tabs & Search */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141822] border border-white/[0.1]">
            {['Todos (14)', 'Competitivo PvP (6)', 'FPS Boost (4)', 'Cielos & Noche (3)', 'Copias de Seguridad (1)'].map((tab, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                  i === 0
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    : 'bg-white/[0.02] text-[#9CA3AF] border-white/[0.04]'
                }`}
              >
                {tab}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141822] border border-white/[0.1] text-xs text-[#9CA3AF] w-72">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Buscar citizen o textura...</span>
          </div>
        </div>

        {/* Mock Citizen Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Citizen Vanilla 1604',
              tag: 'Oficial Rockstar',
              tagColor: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40',
              desc: 'Archivos limpios y originales del juego base para restaurar el cliente en cualquier momento.',
              size: '1.24 GB',
              active: true,
              btnText: 'Instalado',
              badge: 'ORIGINAL',
            },
            {
              title: 'g0d eSports PvP Edition',
              tag: 'Competitivo',
              tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
              desc: 'Cielos limpios sin niebla, partículas de humo reducidas y sombras dinámicas simplificadas.',
              size: '890 MB',
              active: false,
              btnText: 'Instalar',
              badge: '+40 FPS',
            },
            {
              title: 'Bright Nights & Clean Sky',
              tag: 'Visibilidad',
              tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
              desc: 'Iluminación nocturna calibrada para máxima visión en persecuciones y operativos policiales.',
              size: '720 MB',
              active: false,
              btnText: 'Instalar',
              badge: 'PVP NIGHT',
            },
            {
              title: 'Potato Boost 512x Ultra',
              tag: 'Bajos Recursos',
              tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
              desc: 'Texturas comprimidas y shaders optimizados para garantizar más de 60 FPS en cualquier ordenador.',
              size: '480 MB',
              active: false,
              btnText: 'Instalar',
              badge: '+60 FPS',
            },
            {
              title: 'Clean Roads & Water FX',
              tag: 'Rendimiento',
              tagColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
              desc: 'Eliminación de reflejos de asfalto y texturas de agua simplificadas para tiroteos fluidos.',
              size: '610 MB',
              active: false,
              btnText: 'Instalar',
              badge: 'SMOOTH',
            },
            {
              title: 'Bullet Trails & Clean Blood',
              tag: 'Efectos PvP',
              tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
              desc: 'Efectos visuales nítidos de impacto sin sobrecargar el búfer de memoria de la GPU.',
              size: '340 MB',
              active: false,
              btnText: 'Instalar',
              badge: 'AIM BOOST',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#141822] border border-white/[0.12] shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${item.tagColor}`}>
                  {item.tag}
                </span>
                <span className="text-[10px] font-mono font-medium text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  {item.badge}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">{item.desc}</p>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-white/[0.08] text-xs">
                <span className="text-[#8B949E] font-mono text-[11px]">{item.size}</span>
                {item.active ? (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5" />
                    <span>Activo</span>
                  </span>
                ) : (
                  <button className="px-3 py-1 rounded-lg bg-cyan-600/90 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm">
                    <Download className="w-3 h-3" />
                    <span>Instalar</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 
        ========================================================================
        OVERLAY MINIMALISTA (ESTILO EXACTO DE LA FOTO DEL USUARIO)
        Overlay semitransparente que permite ver los componentes de fondo difuminados
        ========================================================================
      */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-[2px]">
        <div className="flex flex-col items-center justify-center text-center space-y-3 max-w-sm select-none">
          {/* Icono de ojo tachado */}
          <div className="text-white/90">
            <EyeOff className="w-10 h-10 stroke-[1.5]" />
          </div>

          {/* Título Oculto */}
          <h2 className="text-xl font-bold text-white tracking-wide">
            Oculto
          </h2>

          {/* Subtítulo limpio y directo */}
          <p className="text-xs text-[#A1A7B5] leading-relaxed max-w-xs">
            Pronto estará disponible la funcionalidad para gestionar, instalar y respaldar tus Citizens de FiveM con un solo clic.
          </p>
        </div>
      </div>
    </div>
  );
};

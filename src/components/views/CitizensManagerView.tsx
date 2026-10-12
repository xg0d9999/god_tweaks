import { EyeOff, Search, FolderOpen, Check, Download } from 'lucide-react';

export const CitizensManagerView: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[580px] rounded-2xl overflow-hidden select-none bg-[#0a0c0f]">
      {/* 
        ========================================================================
        MOCKUP DE FONDO (REALISTA & USABLE, PERO BLURREADO)
        ========================================================================
      */}
      <div
        className="absolute inset-0 p-6 space-y-6 filter blur-xl opacity-35 select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Mock Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-tight">Gestor de Citizens</h2>
            <p className="text-xs text-[#8E95A2]">
              Directorio de instalación y presets de optimización gráfica para FiveM
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-[#8E95A2]">
              <span>C:\Users\User\AppData\Local\FiveM\FiveM.app\citizen</span>
              <FolderOpen className="w-3.5 h-3.5 text-white/60" />
            </div>
          </div>
        </div>

        {/* Mock Tabs & Search */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {['Todos', 'Competitivo PvP', 'FPS Boost', 'Cielos & Noche', 'Copias de Seguridad'].map((tab, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  i === 0 ? 'bg-white/[0.1] text-white' : 'text-[#8E95A2]'
                }`}
              >
                {tab}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-[#8E95A2] w-64">
            <Search className="w-3.5 h-3.5" />
            <span>Buscar citizen o textura...</span>
          </div>
        </div>

        {/* Mock Citizen Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Citizen Vanilla 1604',
              tag: 'Oficial Rockstar',
              desc: 'Archivos limpios y originales del juego base para restaurar el cliente en cualquier momento.',
              size: '1.24 GB',
              active: true,
            },
            {
              title: 'g0d eSports PvP Edition',
              tag: 'Competitivo',
              desc: 'Cielos limpios sin niebla, partículas de humo reducidas y sombras dinámicas simplificadas.',
              size: '890 MB',
              active: false,
            },
            {
              title: 'Bright Nights & Clean Sky',
              tag: 'Visibilidad',
              desc: 'Iluminación nocturna calibrada para máxima visión en persecuciones y operativos.',
              size: '720 MB',
              active: false,
            },
            {
              title: 'Potato Boost 512x',
              tag: 'Bajos Recursos',
              desc: 'Texturas comprimidas y shaders optimizados para garantizar más de 60 FPS en cualquier PC.',
              size: '480 MB',
              active: false,
            },
            {
              title: 'Clean Roads & Water',
              tag: 'Rendimiento',
              desc: 'Eliminación de reflejos de asfalto y texturas de agua simplificadas.',
              size: '610 MB',
              active: false,
            },
            {
              title: 'Bullet Trails & Clean Blood',
              tag: 'Efectos PvP',
              desc: 'Efectos visuales nítidos de impacto sin sobrecargar la memoria GPU.',
              size: '340 MB',
              active: false,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#8E95A2] bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                  {item.tag}
                </span>
                <span className="text-[10px] font-mono text-[#8E95A2]">{item.size}</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                <p className="text-xs text-[#8E95A2] mt-1 leading-relaxed">{item.desc}</p>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-white/[0.04]">
                {item.active ? (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Instalado actualmente</span>
                  </span>
                ) : (
                  <button className="px-3 py-1 rounded-lg bg-white/[0.08] text-white text-xs font-medium flex items-center gap-1.5">
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
        ========================================================================
      */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-md">
        <div className="flex flex-col items-center justify-center text-center space-y-2.5 max-w-sm select-none">
          {/* Icono de ojo tachado */}
          <div className="text-white/90 mb-1">
            <EyeOff className="w-9 h-9 stroke-[1.5]" />
          </div>

          {/* Título Oculto */}
          <h2 className="text-lg font-semibold text-white tracking-wide">
            Oculto
          </h2>

          {/* Subtítulo limpio y directo */}
          <p className="text-xs text-[#9CA3AF] leading-relaxed max-w-xs">
            Pronto estará disponible la funcionalidad para gestionar, instalar y respaldar tus Citizens de FiveM con un solo clic.
          </p>
        </div>
      </div>
    </div>
  );
};

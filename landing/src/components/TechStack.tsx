import React from 'react';
import { Terminal, Shield, Zap, Lock, Code2, Globe, Cpu } from 'lucide-react';

export const TechStack: React.FC = () => {
  const stack = [
    {
      name: "Rust 1.85",
      desc: "Motor nativo de sistema",
      tag: "0 overhead",
      icon: "🦀"
    },
    {
      name: "Tauri v2",
      desc: "Binario ultraligero de ~14MB",
      tag: "Seguro",
      icon: "⚡"
    },
    {
      name: "DirectX 12 / DXGI",
      desc: "Bypass de buffer DWM",
      tag: "0ms FSE",
      icon: "🎮"
    },
    {
      name: "Minisign Crypto",
      desc: "Firmado criptográfico Ed25519",
      tag: "Auditable",
      icon: "🔒"
    },
    {
      name: "Discord API",
      desc: "Webhooks de sanciones en vivo",
      tag: "Embeds",
      icon: "📡"
    },
    {
      name: "Windows 11 Kernel",
      desc: "QPC & HPET Timer 0.50ms",
      tag: "24H2 Ready",
      icon: "🪟"
    }
  ];

  return (
    <section className="py-20 bg-[#07090C] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          ARQUITECTURA DE ALTO RENDIMIENTO
        </span>
        <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
          Construido sobre cimientos modernos y seguros
        </h3>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stack.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-zinc-950/60 border border-white/5 hover:border-white/15 transition-all text-left flex flex-col justify-between"
            >
              <div>
                <div className="text-2xl mb-3">{item.icon}</div>
                <div className="text-sm font-bold text-white">{item.name}</div>
                <div className="text-[11px] text-zinc-400 mt-1">{item.desc}</div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono font-semibold text-brand-gold">
                {item.tag}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

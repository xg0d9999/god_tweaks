import { motion } from "framer-motion";
import {
  Activity,
  Layers,
  Crosshair,
  Sliders,
  RotateCcw,
  Cpu,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { TabType } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  appliedCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  isSpecial?: boolean;
  isBlocked?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  appliedCount,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user, userRecord, logout } = useAuth();
  const tweaksBlocked = userRecord?.can_use_tweaks === false;

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Activity className="w-4 h-4 flex-shrink-0" />,
    },
    {
      id: "presets",
      label: "Planes de Optimización",
      icon: <Layers className="w-4 h-4 flex-shrink-0" />,
      isBlocked: tweaksBlocked,
    },
    {
      id: "fivem",
      label: "FiveM & GTA V",
      icon: <Crosshair className="w-4 h-4 flex-shrink-0" />,
      isBlocked: tweaksBlocked,
    },
    {
      id: "advanced",
      label: "Modo Avanzado",
      icon: <Sliders className="w-4 h-4 flex-shrink-0" />,
      badge: tweaksBlocked ? "BLOQUEADO" : "PRO",
      isBlocked: tweaksBlocked,
    },
    {
      id: "backup",
      label: "Restauración & Backup",
      icon: <RotateCcw className="w-4 h-4 flex-shrink-0" />,
    },
    ...(userRecord?.is_admin
      ? [
          {
            id: "admin" as TabType,
            label: "Panel Admin",
            icon: <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />,
            badge: "ROOT",
            isSpecial: true,
          },
        ]
      : []),
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 68 : 240 }}
      transition={{ type: "spring", stiffness: 450, damping: 35 }}
      className="flex flex-col h-full p-2.5 bg-[#0E1013]/70 backdrop-blur-2xl border-r border-white/[0.08] select-none flex-shrink-0 overflow-hidden"
    >
      {/* Top Header & Collapse Toggle */}
      <div className="flex-shrink-0 flex items-center justify-between px-2 py-1 mb-1">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] font-semibold tracking-wider text-[#717680] uppercase truncate"
          >
            Módulos
          </motion.span>
        )}

        <button
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          title={isCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          className={`p-1 rounded-lg text-[#717680] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer ${
            isCollapsed ? "mx-auto" : "ml-auto"
          }`}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Navigation list (flex-1 min-h-0: scrolls smoothly if height is limited) */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-0.5 py-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`relative w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200 group text-left cursor-pointer ${
                isCollapsed ? "justify-center p-2.5" : "justify-between px-3 py-2"
              } ${
                isActive
                  ? "text-white shadow-subtleGlow"
                  : "text-[#717680] hover:text-[#EDEDED] hover:bg-white/[0.04]"
              }`}
            >
              {/* Active Tab indicator pill with Framer Motion */}
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.14] backdrop-blur-md"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}

              <div
                className={`relative z-10 flex items-center ${
                  isCollapsed ? "justify-center" : "gap-2.5 min-w-0"
                }`}
              >
                <span
                  className={`transition-colors duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-[#717680] group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>

                {!isCollapsed && (
                  <span className="tracking-tight text-xs truncate">
                    {item.label}
                  </span>
                )}
              </div>

              {!isCollapsed && item.isBlocked && (
                <span className="relative z-10 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20 flex-shrink-0 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Bloqueado</span>
                </span>
              )}

              {!isCollapsed && !item.isBlocked && item.badge && (
                <span className="relative z-10 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-white/[0.08] text-white/90 border border-white/10 flex-shrink-0">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Area: Always firmly anchored at the bottom, never clipped */}
      <div className="flex-shrink-0 pt-2 space-y-2 border-t border-white/[0.06]">
        {/* Bottom status widget */}
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
          {!isCollapsed ? (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 text-[#717680]">
                  <Cpu className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Optimizaciones</span>
                </div>
                <span className="font-mono text-white/90 text-[11px] font-medium">
                  {appliedCount} activas
                </span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (appliedCount / 8) * 100)}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 py-1" title={`${appliedCount} optimizaciones activas`}>
              <Cpu className="w-3.5 h-3.5 text-[#717680]" />
              <span className="font-mono text-[9px] text-white/80">{appliedCount}</span>
            </div>
          )}
        </div>

        {/* Discord User Badge (Bottom-Left) */}
        {user ? (
          <div className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] backdrop-blur-md transition-all">
            {!isCollapsed ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border border-white/15 bg-white/[0.06] shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                      }}
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0E1013]" />
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col">
                    <span className="text-xs font-semibold text-white truncate leading-tight">
                      {user.username}
                    </span>
                    <span className="text-[10px] font-mono text-[#8B949E] truncate">
                      HWID Sincronizado
                    </span>
                  </div>
                </div>

                {/* Botón explícito para cerrar sesión */}
                <button
                  onClick={logout}
                  title="Cerrar sesión de Discord"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white/[0.04] hover:bg-rose-500/15 active:scale-[0.98] border border-white/[0.08] hover:border-rose-500/25 text-[#9CA3AF] hover:text-rose-200 text-[11px] font-medium transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#8B949E] group-hover:text-rose-300" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-0.5">
                <div className="relative" title={`Conectado como ${user.username}`}>
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-7 h-7 rounded-full object-cover border border-white/15 shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#0E1013]" />
                </div>
                <button
                  onClick={logout}
                  title={`Cerrar sesión (${user.username})`}
                  className="p-1 rounded-lg text-[#8B949E] hover:text-rose-200 hover:bg-rose-500/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </motion.aside>
  );
};

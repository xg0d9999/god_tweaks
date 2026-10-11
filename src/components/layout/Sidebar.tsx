import { motion } from "framer-motion";
import {
  Activity,
  Flame,
  Layers,
  TrendingUp,
  Crosshair,
  Gamepad2,
  Ghost,
  Radio,
  Sparkles,
  RotateCcw,
  Cpu,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  appliedCount,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();
  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Activity className="w-4 h-4 flex-shrink-0" />,
    },
    {
      id: "god_mode",
      label: "1-Click God Mode",
      icon: <Flame className="w-4 h-4 text-white flex-shrink-0" />,
      badge: "ESPORTS",
      isSpecial: true,
    },
    {
      id: "presets",
      label: "Planes de Optimización",
      icon: <Layers className="w-4 h-4 flex-shrink-0" />,
    },
    {
      id: "benchmark",
      label: "Telemetría & Benchmark",
      icon: <TrendingUp className="w-4 h-4 flex-shrink-0" />,
      badge: "NUEVO",
    },
    {
      id: "fivem",
      label: "FiveM & GTA V",
      icon: <Crosshair className="w-4 h-4 flex-shrink-0" />,
    },
    {
      id: "hispan",
      label: "HispanLife Sanciones",
      icon: <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
      badge: "STAFF",
      isSpecial: true,
    },
    {
      id: "gaming",
      label: "Input Lag & Gaming",
      icon: <Gamepad2 className="w-4 h-4 flex-shrink-0" />,
    },
    {
      id: "debloat",
      label: "Debloat & Privacidad",
      icon: <Ghost className="w-4 h-4 flex-shrink-0" />,
    },
    {
      id: "network",
      label: "Red & Ping",
      icon: <Radio className="w-4 h-4 flex-shrink-0" />,
    },
    {
      id: "memory",
      label: "Limpieza Profunda",
      icon: <Sparkles className="w-4 h-4 flex-shrink-0" />,
    },
    {
      id: "backup",
      label: "Restauración & Backup",
      icon: <RotateCcw className="w-4 h-4 flex-shrink-0" />,
    },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 68 : 240 }}
      transition={{ type: "spring", stiffness: 450, damping: 35 }}
      className="flex flex-col justify-between p-2.5 bg-[#0E1013]/70 backdrop-blur-2xl border-r border-white/[0.08] select-none h-[calc(100vh-2.75rem)] flex-shrink-0 overflow-hidden"
    >
      {/* Top Header & Collapse Toggle */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-2 py-1.5 mb-1">
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

        {/* Navigation list */}
        <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-9.5rem)] pr-0.5">
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

                {!isCollapsed && item.badge && (
                  <span className="relative z-10 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-white/[0.08] text-white/90 border border-white/10 flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Area: Status & Discord User Profile */}
      <div className="space-y-2 mt-auto">
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
        {user && (
          <div className="p-2 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/25 backdrop-blur-md">
            {!isCollapsed ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="w-7 h-7 rounded-full object-cover border border-[#5865F2]/50 bg-[#5865F2]/30"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                      }}
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0E1013]" />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs font-medium text-white truncate leading-tight">
                      {user.username}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-300/80 truncate">
                      HWID Sincronizado
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Cerrar sesión de Discord"
                  className="p-1 rounded-lg text-[#828792] hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={logout}
                  title={`Conectado como ${user.username} (Clic para salir)`}
                  className="relative cursor-pointer group"
                >
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="w-7 h-7 rounded-full object-cover border border-[#5865F2]/50 group-hover:border-rose-400 transition-colors"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png';
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-[#0E1013]" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.aside>
  );
};

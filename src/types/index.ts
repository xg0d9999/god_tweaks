export type TabType =
  | "dashboard"
  | "presets"
  | "fivem"
  | "citizens"
  | "advanced"
  | "backup"
  | "hispan"
  | "admin";

export type AppMode = "optimizer" | "hispan";

export type SafetyLevel = "Seguro" | "Gaming" | "Extremo";
export type PresetType = "lite" | "premium" | "ultra";

export interface ActivePlanData {
  id: PresetType;
  title: string;
  appliedAt: string;
}

export interface SystemMetrics {
  cpu_usage: number;
  ram_total_mb: number;
  ram_used_mb: number;
  ram_usage_percent: number;
  cpu_brand: string;
  cpu_cores: number;
  os_name: string;
  os_version: string;
  is_admin: boolean;
}

export interface GamingStatus {
  hpet_disabled: boolean;
  ultimate_power_active: boolean;
  gamedvr_disabled: boolean;
  mmcss_optimized: boolean;
  extreme_tweaks_active?: boolean;
}

export interface DebloatStatus {
  telemetry_disabled: boolean;
  cortana_search_disabled: boolean;
  copilot_disabled: boolean;
}

export type TargetGameId = "general" | "fivem" | "fortnite" | "valorant" | "cs2";

export interface HardwareProfile {
  hwid: string;
  cpu: string;
  cpu_cores: number;
  ram_mb: number;
  gpu: string;
  os: string;
  cpu_vendor?: "amd" | "intel" | "other";
  gpu_vendor?: "nvidia" | "amd" | "intel" | "other";
}

export interface GameProfileOption {
  id: TargetGameId;
  name: string;
  shortName: string;
  categoryBadge: string;
  description: string;
  bgImage: string;
  logoText: string;
  themeColor: string;
  glowColor: string;
  exclusiveTweaks: string[];
}

export interface NetworkStatus {
  nagle_disabled: boolean;
  network_throttling_disabled: boolean;
  qos_limit_disabled?: boolean;
}

export interface FiveMStatus {
  is_installed: boolean;
  priority_active: boolean;
}

export interface BackupItem {
  filename: string;
  path: string;
  size_kb: number;
  created_at: string;
}

export interface RestorePointItem {
  id: string;
  description: string;
  sequence_number?: number;
  created_at: string;
  status: string;
}

export interface PcBenchmarkMetrics {
  dpc_latency_before_us: number;
  dpc_latency_after_us: number;
  timer_res_before_ms: number;
  timer_res_after_ms: number;
  bg_processes_before: number;
  bg_processes_after: number;
  responsiveness_score_before: number;
  responsiveness_score_after: number;
  overall_improvement_percent: number;
}

export interface FiveMBenchmarkMetrics {
  fps_before: number;
  fps_after: number;
  one_percent_low_before: number;
  one_percent_low_after: number;
  frame_time_before_ms: number;
  frame_time_after_ms: number;
  stutters_per_session_before: number;
  stutters_per_session_after: number;
  texture_loss_eliminated: boolean;
  overall_fps_boost_percent: number;
  citizen_log_found: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

export interface PresetPlan {
  id: PresetType;
  title: string;
  tag: string;
  description: string;
  features: string[];
  recommendedFor: string;
}

export interface TestBenchItem {
  id: string;
  name: string;
  category: string;
  status: "PASS" | "WARN" | "FAIL";
  message: string;
  duration_ms: number;
  details?: string;
}

export interface TestBenchReport {
  timestamp: string;
  total_tests: number;
  passed_tests: number;
  warning_tests: number;
  failed_tests: number;
  score_percent: number;
  total_duration_ms: number;
  items: TestBenchItem[];
}

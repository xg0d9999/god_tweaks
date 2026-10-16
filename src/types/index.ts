export type TabType =
  | "dashboard"
  | "presets"
  | "citizens"
  | "advanced"
  | "backup"
  | "benchmark"
  | "hispan"
  | "admin"
  | "tickets";

export type AppMode = "optimizer" | "hispan";

export type SafetyLevel = "Seguro" | "Gaming" | "Extremo";
export type PresetType = "lite" | "premium" | "ultra";

export interface ActivePlanData {
  id: PresetType;
  title: string;
  appliedAt: string;
  targetGame?: TargetGameId;
  isPreGameBoost?: boolean;
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

export interface BenchmarkSnapshot {
  timestamp: string;
  ping_ms: number;
  jitter_ms: number;
  timer_resolution_ms: number;
  ram_total_mb: number;
  ram_used_mb: number;
  ram_available_mb: number;
  ram_usage_percent: number;
  process_count: number;
  thread_count: number;
  cpu_compute_latency_us: number;
  score: number;
  hpet_disabled: boolean;
  ultimate_power: boolean;
  gamedvr_disabled: boolean;
  mmcss_optimized: boolean;
  nagle_disabled: boolean;
  memory_compression_disabled: boolean;
  network_throttling_disabled: boolean;
}

export interface StaffIntervention {
  discord_id: string;
  username: string;
  avatar_url?: string;
  interventions_count: number;
  last_intervention_at: string;
  recent_tickets: string[];
}

export interface TicketAuditRecord {
  id: string;
  channel_id: string;
  channel_name: string;
  audited_at: string;
  summary: string;
  rewarded_staff: {
    discord_id: string;
    username: string;
    contribution: string;
  }[];
  ignored_staff: {
    username: string;
    reason: string;
  }[];
}

export interface TicketSession {
  id: string;
  name: string;
  started_at: string;
  ended_at?: string;
  is_active: boolean;
  total_tickets: number;
  staff_stats: Record<string, StaffIntervention>;
  audit_history: TicketAuditRecord[];
}

export type TokenMode = "zero_token" | "user" | "bot";

export interface CapturedDiscordTicket {
  channel_name: string;
  transcript: string;
  source: string;
  timestamp: string;
}

export interface TicketBotConfig {
  token_mode: TokenMode;
  token?: string;
  deepseek_api_key: string;
  ticket_hotkey?: string;
  guild_id?: string;
  ticket_category_id?: string;
  custom_prompt?: string;
  bot_token?: string;
  notify_toast?: boolean;
}

export interface StaffRankItem {
  id: string;
  name: string;
  is_support: boolean;
  is_high_staff: boolean;
  order: number;
}

export interface StaffMemberItem {
  id: string;
  name: string;
  rank_id: string;
  count: number;
}

export interface ManualTicketSession {
  id: string;
  date: string;
  code: string;
  total_tickets: number;
  staff_members: StaffMemberItem[];
  created_at: string;
}

export type TicketActivityType =
  | 'add_staff'
  | 'remove_staff'
  | 'change_rank'
  | 'copy_template'
  | 'reset_counts'
  | 'restore_roster'
  | 'change_shift';

export interface TicketActivityLog {
  id: string;
  type: TicketActivityType;
  title: string;
  details: string;
  timestamp: string;
  date: string;
  operator?: string;
}

export interface DiskDriveInfo {
  name: string;
  mount_point: string;
  total_bytes: number;
  available_bytes: number;
  used_bytes: number;
  usage_percentage: number;
  file_system: string;
  is_removable: boolean;
  disk_type: string;
}

export interface DiskJunkCategory {
  id: string;
  name: string;
  description: string;
  category_type: "system" | "gaming" | "app" | string;
  bytes: number;
  formatted_size: string;
  file_count: number;
  is_safe: boolean;
  recommended: boolean;
}

export interface DiskJunkScanResult {
  categories: DiskJunkCategory[];
  total_bytes: number;
  formatted_total: string;
  total_files: number;
}

export interface DiskCleanResult {
  bytes_freed: number;
  formatted_freed: string;
  files_deleted: number;
  categories_cleaned: string[];
  errors_count: number;
  message: string;
}

export interface FolderConsumptionItem {
  name: string;
  path: string;
  bytes: number;
  formatted_size: string;
  percentage: number;
}


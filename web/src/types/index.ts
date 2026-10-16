export interface StaffAccount {
  id: string;
  username: string;
  display_name: string;
  role: 'owner' | 'admin' | 'staff';
  is_active: boolean;
  discord_id?: string | null;
  discord_username?: string | null;
  discord_avatar?: string | null;
  created_by?: string;
  created_at?: string;
  last_login_at?: string;
}

export interface AppUser {
  id: string;
  discord_id: string;
  discord_username: string;
  discord_avatar?: string | null;
  ip_address?: string | null;
  hwid?: string | null;
  cpu_info?: string | null;
  ram_info?: string | null;
  os_info?: string | null;
  gpu_info?: string | null;
  last_login_at?: string;
  created_at?: string;
  can_use_tweaks: boolean;
  can_use_sanciones: boolean;
  can_use_citizens: boolean;
  can_use_tickets: boolean;
  is_admin: boolean;
}

export interface StaffAuditLog {
  id: string;
  action: string;
  operator_username: string;
  target_user?: string | null;
  details?: string | null;
  created_at: string;
}

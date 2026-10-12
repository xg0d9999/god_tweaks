import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://oparanbvwqduvfrejlir.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wYXJhbmJ2d3FkdXZmcmVqbGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MDEzNDMsImV4cCI6MjEwNzI3NzM0M30.uWL-1FE-Wxsm79sm7JOzYs7bwmm_itP3hwwlDpzKRGE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface AppUserRecord {
  id?: string;
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
  can_use_tweaks?: boolean;
  can_use_sanciones?: boolean;
  is_admin?: boolean;
}

export interface AppUpdateRecord {
  id: string;
  version?: string;
  title: string;
  changelog: string;
  created_by?: string;
  published_at: string;
}

/**
 * Registra o actualiza el perfil del usuario de Discord en Supabase con telemetría de hardware e IP.
 */
export async function upsertAppUser(user: AppUserRecord): Promise<AppUserRecord> {
  const { data, error } = await supabase
    .from('app_users')
    .upsert(
      {
        discord_id: user.discord_id,
        discord_username: user.discord_username,
        discord_avatar: user.discord_avatar || null,
        ip_address: user.ip_address || null,
        hwid: user.hwid || null,
        cpu_info: user.cpu_info || null,
        ram_info: user.ram_info || null,
        os_info: user.os_info || null,
        gpu_info: user.gpu_info || null,
        last_login_at: new Date().toISOString(),
      },
      { onConflict: 'discord_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('[Supabase] Error al sincronizar usuario:', error);
    throw error;
  }
  return data as AppUserRecord;
}

/**
 * Obtiene el registro completo de un usuario por su discord_id (incluye permisos y rol).
 */
export async function fetchCurrentUserRecord(discordId: string): Promise<AppUserRecord | null> {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('discord_id', discordId)
    .maybeSingle();

  if (error) {
    console.warn('[Supabase] Error al consultar usuario actual:', error);
    return null;
  }
  return data as AppUserRecord | null;
}

/**
 * Obtiene todos los usuarios registrados para el panel de administración.
 */
export async function fetchAllUsers(): Promise<AppUserRecord[]> {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .order('last_login_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Error al consultar lista de usuarios:', error);
    throw error;
  }
  return (data || []) as AppUserRecord[];
}

/**
 * Actualiza permisos de acceso o rol de un usuario en Supabase (Solo Admin).
 */
export async function updateUserPermissions(
  discordId: string,
  perms: { can_use_tweaks?: boolean; can_use_sanciones?: boolean; is_admin?: boolean }
): Promise<AppUserRecord> {
  const { data, error } = await supabase
    .from('app_users')
    .update(perms)
    .eq('discord_id', discordId)
    .select();

  if (error) {
    console.error('[Supabase] Error al actualizar permisos de usuario:', error);
    throw error;
  }
  if (!data || data.length === 0) {
    throw new Error(`No se encontró el registro para el usuario con ID ${discordId}`);
  }
  return data[0] as AppUserRecord;
}

/**
 * Obtiene las últimas actualizaciones publicadas por el bot de Discord.
 */
export async function fetchAppUpdates(): Promise<AppUpdateRecord[]> {
  const { data, error } = await supabase
    .from('app_updates')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(5);

  if (error) {
    console.warn('[Supabase] Error al consultar actualizaciones:', error);
    return [];
  }
  return data as AppUpdateRecord[];
}

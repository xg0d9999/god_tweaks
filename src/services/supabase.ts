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

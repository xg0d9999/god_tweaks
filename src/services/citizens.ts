import { supabase } from './supabase';

export interface CitizenRecord {
  id: string;
  title: string;
  category: string;
  performance_badge: string;
  description: string;
  cover_url: string;
  download_url: string;
  file_size_bytes: number;
  file_size_formatted: string;
  version: string;
  downloads_count: number;
  is_published: boolean;
  is_featured: boolean;
  author: string;
  created_at: string;
  updated_at: string;
}

export interface FiveMCitizenInfo {
  fivem_app_path: string;
  citizen_path: string;
  is_fivem_installed: boolean;
  is_fivem_running: boolean;
  active_citizen_id: string | null;
  installed_citizen_ids: string[];
  has_vanilla_backup: boolean;
}

export interface CitizenActionResult {
  success: boolean;
  message: string;
  active_citizen_id: string | null;
}

/**
 * Consulta la lista de citizens disponibles desde Supabase.
 * Los administradores pueden ver todos (incluidos borradores); los usuarios solo los publicados.
 */
export async function fetchCitizens(isAdmin: boolean = false): Promise<CitizenRecord[]> {
  try {
    let query = supabase
      .from('app_citizens')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('downloads_count', { ascending: false });

    if (!isAdmin) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('[Citizens Service] Error al consultar citizens:', error);
      return [];
    }
    return (data || []) as CitizenRecord[];
  } catch (err) {
    console.error('[Citizens Service] Excepción al consultar citizens:', err);
    return [];
  }
}

/**
 * Incrementa el contador de descargas de un citizen.
 */
export async function incrementCitizenDownload(id: string): Promise<void> {
  try {
    const { data } = await supabase
      .from('app_citizens')
      .select('downloads_count')
      .eq('id', id)
      .single();

    if (data) {
      await supabase
        .from('app_citizens')
        .update({ downloads_count: (data.downloads_count || 0) + 1 })
        .eq('id', id);
    }
  } catch (err) {
    console.warn('[Citizens Service] No se pudo incrementar descarga:', err);
  }
}

export type CreateCitizenPayload = {
  title: string;
  download_url: string;
  description: string;
  category?: string;
  performance_badge?: string;
  cover_url?: string;
  file_size_bytes?: number;
  file_size_formatted?: string;
  version?: string;
  is_published?: boolean;
  is_featured?: boolean;
  author?: string;
};

/**
 * Crea un nuevo citizen en el catálogo (Función exclusiva de Admin).
 */
export async function createCitizen(payload: CreateCitizenPayload): Promise<CitizenRecord> {
  const { data, error } = await supabase
    .from('app_citizens')
    .insert({
      title: payload.title,
      category: payload.category || 'pvp',
      performance_badge: payload.performance_badge || '+40 FPS',
      description: payload.description,
      cover_url: payload.cover_url,
      download_url: payload.download_url,
      file_size_bytes: payload.file_size_bytes || 0,
      file_size_formatted: payload.file_size_formatted || '500 MB',
      version: payload.version || 'v1.0',
      is_published: payload.is_published ?? true,
      is_featured: payload.is_featured ?? false,
      author: payload.author || 'Admin g0d suite',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error al crear Citizen en Supabase: ${error.message}`);
  }
  return data as CitizenRecord;
}

/**
 * Actualiza los metadatos o estado de un citizen (Función exclusiva de Admin).
 */
export async function updateCitizen(id: string, updates: Partial<CitizenRecord>): Promise<CitizenRecord> {
  const { data, error } = await supabase
    .from('app_citizens')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error al actualizar Citizen: ${error.message}`);
  }
  return data as CitizenRecord;
}

/**
 * Elimina un citizen del catálogo en la nube (Función exclusiva de Admin).
 */
export async function deleteCitizen(id: string): Promise<void> {
  const { error } = await supabase
    .from('app_citizens')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error al eliminar Citizen de la base de datos: ${error.message}`);
  }
}

/**
 * Sube un archivo .zip, .rar o .7z directamente al bucket 'citizens-packages' de Supabase Storage.
 * Devuelve la URL pública y el tamaño formateado.
 */
export async function uploadCitizenPackage(
  file: File
): Promise<{ publicUrl: string; fileSizeFormatted: string; fileSizeBytes: number }> {
  const sanitizedName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = `packages/${sanitizedName}`;

  const { error } = await supabase.storage
    .from('citizens-packages')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Error al subir archivo a Supabase Storage: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('citizens-packages')
    .getPublicUrl(filePath);

  const bytes = file.size;
  const mb = (bytes / (1024 * 1024)).toFixed(0);
  const fileSizeFormatted =
    bytes > 1024 * 1024 * 1024
      ? `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
      : `${mb} MB`;

  return {
    publicUrl: publicUrlData.publicUrl,
    fileSizeFormatted,
    fileSizeBytes: bytes,
  };
}

/**
 * Sube una imagen de portada para un Citizen a Supabase Storage.
 */
export async function uploadCitizenCover(file: File): Promise<string> {
  const sanitizedName = `covers/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { error } = await supabase.storage
    .from('citizens-packages')
    .upload(sanitizedName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Error al subir imagen de portada: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('citizens-packages')
    .getPublicUrl(sanitizedName);

  return publicUrlData.publicUrl;
}

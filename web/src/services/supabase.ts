import { createClient } from '@supabase/supabase-js';
import { StaffAccount, AppUser, StaffAuditLog } from '../types';

export const SUPABASE_URL = 'https://oparanbvwqduvfrejlir.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wYXJhbmJ2d3FkdXZmcmVqbGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MDEzNDMsImV4cCI6MjEwNzI3NzM0M30.uWL-1FE-Wxsm79sm7JOzYs7bwmm_itP3hwwlDpzKRGE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Web Crypto SHA-256 Helper
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Iniciar sesión
export async function loginStaffAccount(username: string, passwordPlain: string): Promise<StaffAccount> {
  const hash = await hashPassword(passwordPlain);
  const { data, error } = await supabase
    .from('staff_accounts')
    .select('*')
    .eq('username', username.trim().toLowerCase())
    .eq('password_hash', hash)
    .single();

  if (error || !data) {
    throw new Error('Usuario o contraseña incorrectos.');
  }

  if (!data.is_active) {
    throw new Error('Esta cuenta ha sido deshabilitada por la administración.');
  }

  // Update last_login_at
  await supabase
    .from('staff_accounts')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', data.id);

  // Log login action
  await logStaffAction('login', data.username, data.username, 'Inicio de sesión en el panel web de staff');

  return data as StaffAccount;
}

// Registrar evento en auditoría
export async function logStaffAction(
  action: string,
  operatorUsername: string,
  targetUser?: string | null,
  details?: string | null
): Promise<void> {
  try {
    await supabase.from('staff_audit_logs').insert([
      {
        action,
        operator_username: operatorUsername,
        target_user: targetUser || null,
        details: details || null,
      },
    ]);
  } catch (err) {
    console.error('Error logging staff action:', err);
  }
}

// Obtener todas las cuentas de staff
export async function getStaffAccounts(): Promise<StaffAccount[]> {
  const { data, error } = await supabase
    .from('staff_accounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching staff accounts:', error);
    return [];
  }
  return (data || []) as StaffAccount[];
}

// Crear nueva cuenta de staff (Solo Owner / SuperAdmin)
export async function createStaffAccount(
  username: string,
  passwordPlain: string,
  displayName: string,
  role: 'admin' | 'staff',
  operator: StaffAccount
): Promise<StaffAccount> {
  if (operator.role !== 'owner') {
    throw new Error('Solo el Dueño (SuperAdmin) tiene autorización para crear cuentas de staff.');
  }

  const hash = await hashPassword(passwordPlain);
  const newAccount = {
    username: username.trim().toLowerCase(),
    password_hash: hash,
    display_name: displayName.trim(),
    role,
    is_active: true,
    created_by: operator.username,
  };

  const { data, error } = await supabase
    .from('staff_accounts')
    .insert([newAccount])
    .select()
    .single();

  if (error) {
    throw new Error(error.message.includes('unique') ? 'El nombre de usuario ya está registrado.' : error.message);
  }

  await logStaffAction(
    'create_staff',
    operator.username,
    username,
    `Cuenta creada con rol [${role.toUpperCase()}] y nombre "${displayName}"`
  );

  return data as StaffAccount;
}

// Cambiar contraseña a cualquier usuario a su antojo (Solo Owner)
export async function changeStaffPassword(
  targetStaffId: string,
  newPasswordPlain: string,
  operator: StaffAccount
): Promise<void> {
  // If not owner and trying to change someone else's password: error
  if (operator.role !== 'owner' && operator.id !== targetStaffId) {
    throw new Error('Solo el Dueño (SuperAdmin) puede cambiar la contraseña de otros miembros.');
  }

  const hash = await hashPassword(newPasswordPlain);
  const { data: targetData } = await supabase
    .from('staff_accounts')
    .select('username')
    .eq('id', targetStaffId)
    .single();

  const targetUsername = targetData?.username || targetStaffId;

  const { error } = await supabase
    .from('staff_accounts')
    .update({ password_hash: hash })
    .eq('id', targetStaffId);

  if (error) throw new Error(error.message);

  await logStaffAction(
    'change_password',
    operator.username,
    targetUsername,
    `Contraseña actualizada manualmente por ${operator.username}`
  );
}

// Habilitar o deshabilitar cuenta de staff (Protección: Nunca al Dueño)
export async function toggleStaffActiveStatus(
  targetStaffId: string,
  activeState: boolean,
  operator: StaffAccount
): Promise<void> {
  const { data: target } = await supabase
    .from('staff_accounts')
    .select('*')
    .eq('id', targetStaffId)
    .single();

  if (!target) throw new Error('Cuenta de staff no encontrada.');

  // REGLA ABSOLUTA: Nadie puede deshabilitar al Owner
  if (target.role === 'owner') {
    throw new Error('¡Acción denegada! La cuenta del Dueño (SuperAdmin) nunca puede ser deshabilitada.');
  }

  if (operator.role !== 'owner') {
    throw new Error('Solo el Dueño puede habilitar o deshabilitar cuentas de staff.');
  }

  const { error } = await supabase
    .from('staff_accounts')
    .update({ is_active: activeState })
    .eq('id', targetStaffId);

  if (error) throw new Error(error.message);

  await logStaffAction(
    activeState ? 'enable_staff' : 'disable_staff',
    operator.username,
    target.username,
    `Cuenta de staff marcada como ${activeState ? 'ACTIVA' : 'SUSPENDIDA'}`
  );
}

// Vincular cuenta de staff con Discord
export async function linkStaffDiscord(
  staffId: string,
  discordId: string,
  discordUsername: string,
  discordAvatar?: string | null
): Promise<void> {
  const { error } = await supabase
    .from('staff_accounts')
    .update({
      discord_id: discordId.trim(),
      discord_username: discordUsername.trim(),
      discord_avatar: discordAvatar || null,
    })
    .eq('id', staffId);

  if (error) throw new Error(error.message);

  await logStaffAction(
    'link_discord',
    discordUsername,
    discordUsername,
    `Cuenta vinculada a Discord ID: ${discordId}`
  );
}

// Obtener todos los usuarios de la suite (app_users)
export async function getAppUsers(): Promise<AppUser[]> {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching app users:', error);
    return [];
  }
  return (data || []) as AppUser[];
}

// Actualizar accesos de un usuario normal (Staff solo puede gestionar Sanciones y Tickets; Dueño/Admin todo)
export async function updateAppUserAccess(
  targetUserId: string,
  field: 'can_use_sanciones' | 'can_use_tweaks' | 'can_use_citizens' | 'can_use_tickets' | 'all',
  value: boolean,
  operator: StaffAccount,
  cachedUser?: { username: string; is_admin: boolean }
): Promise<void> {
  let targetUsername = cachedUser?.username || '';
  let isAdmin = cachedUser?.is_admin || false;

  if (!cachedUser) {
    const { data: targetUser } = await supabase
      .from('app_users')
      .select('discord_username, is_admin')
      .eq('id', targetUserId)
      .single();

    if (!targetUser) throw new Error('Usuario no encontrado.');
    targetUsername = targetUser.discord_username;
    isAdmin = targetUser.is_admin;
  }

  // REGLA DE SEGURIDAD: Nadie puede revocarle permisos al Dueño
  if (isAdmin && !value && operator.role !== 'owner') {
    throw new Error('¡Protección de Seguridad! Nadie puede revocarle permisos al Dueño / Administrador Principal.');
  }

  // REGLA ESTRICTA DE STAFF: El rol 'staff' SOLO puede gestionar Sanciones y Tickets. Tweaks y Citizens NO.
  if (operator.role === 'staff') {
    if (field === 'can_use_tweaks' || field === 'can_use_citizens') {
      throw new Error('Permiso denegado: El rol Staff únicamente puede gestionar Sanciones y Conteo de Tickets.');
    }
  }

  let updatePayload: Record<string, boolean> = {};
  if (field === 'all') {
    if (operator.role === 'staff') {
      // Para staff, la acción rápida solo aplica a sus módulos autorizados
      updatePayload = {
        can_use_sanciones: value,
        can_use_tickets: value,
      };
    } else {
      updatePayload = {
        can_use_sanciones: value,
        can_use_tweaks: value,
        can_use_citizens: value,
        can_use_tickets: value,
      };
    }
  } else {
    updatePayload = { [field]: value };
  }

  const { error } = await supabase
    .from('app_users')
    .update(updatePayload)
    .eq('id', targetUserId);

  if (error) throw new Error(error.message);

  const moduleLabel =
    field === 'all'
      ? (operator.role === 'staff' ? 'SANCIONES Y TICKETS' : 'TODOS LOS MÓDULOS')
      : field === 'can_use_sanciones'
      ? 'SANCIONES'
      : field === 'can_use_tickets'
      ? 'TICKETS'
      : field === 'can_use_tweaks'
      ? 'OPTIMIZADOR (TWEAKS)'
      : 'CITIZENS';

  logStaffAction(
    value ? 'grant_access' : 'revoke_access',
    operator.username,
    targetUsername,
    `Permiso ${moduleLabel} modificado a [${value ? 'HABILITADO' : 'BLOQUEADO'}]`
  ).catch((e) => console.error('Error logging staff action:', e));
}

// Obtener registros de auditoría (filtrados para Staff: solo Sanciones y Conteo de Tickets)
export async function getAuditLogs(operator?: StaffAccount): Promise<StaffAuditLog[]> {
  const { data, error } = await supabase
    .from('staff_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }

  const rawLogs = (data || []) as StaffAuditLog[];

  // Si el usuario que consulta tiene rol 'staff', filtrar exclusivamente logs de sanciones y tickets
  if (operator && operator.role === 'staff') {
    return rawLogs.filter((log) => {
      const details = (log.details || '').toUpperCase();
      const action = (log.action || '').toUpperCase();
      return (
        details.includes('SANCIONES') ||
        details.includes('TICKET') ||
        action.includes('SANCION') ||
        action.includes('TICKET')
      );
    });
  }

  return rawLogs;
}

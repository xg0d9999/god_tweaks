import React, { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { upsertAppUser, fetchCurrentUserRecord, AppUserRecord, supabase } from '../services/supabase';
import { logUserLogin, setGlobalLoggerSession } from '../services/discordLogger';

export interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
  avatar_url: string;
}

export interface HardwareProfile {
  hwid: string;
  cpu: string;
  cpu_cores: number;
  ram_mb: number;
  gpu: string;
  os: string;
}

interface AuthContextType {
  user: DiscordUser | null;
  userRecord: AppUserRecord | null;
  hardware: HardwareProfile | null;
  ipAddress: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  startDiscordOAuth: () => Promise<void>;
  loginWithDiscord: (userData: { id: string; username: string; avatar_url?: string }) => Promise<void>;
  logout: () => void;
  refreshHardware: () => Promise<HardwareProfile | null>;
  refreshUserRecord: () => Promise<AppUserRecord | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'g0d_suite_auth_session';
const RECORD_STORAGE_KEY = 'g0d_suite_user_record';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [userRecord, setUserRecord] = useState<AppUserRecord | null>(() => {
    try {
      const cached = localStorage.getItem(RECORD_STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [hardware, setHardware] = useState<HardwareProfile | null>(null);
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar hardware local mediante Rust IPC
  const fetchLocalHardware = async (): Promise<HardwareProfile | null> => {
    try {
      const hw = await invoke<HardwareProfile>('get_hardware_profile');
      setHardware(hw);
      return hw;
    } catch (err) {
      console.warn('[Auth] No se pudo obtener perfil de hardware desde Tauri (modo web o mock):', err);
      const mockHw: HardwareProfile = {
        hwid: 'HWID-LOCAL-DEV-NODE',
        cpu: 'AMD Ryzen / Intel Core Gaming Processor',
        cpu_cores: 12,
        ram_mb: 16384,
        gpu: 'NVIDIA GeForce RTX 3060',
        os: 'Windows 11 Pro 64-bit',
      };
      setHardware(mockHw);
      return mockHw;
    }
  };

  // Obtener IP pública del cliente
  const fetchPublicIp = async (): Promise<string> => {
    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const json = await res.json();
        setIpAddress(json.ip);
        return json.ip;
      }
    } catch {
      // Fallback secundario
      try {
        const res2 = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
        if (res2.ok) {
          const json2 = await res2.json();
          setIpAddress(json2.ip);
          return json2.ip;
        }
      } catch {
        // En caso de estar sin internet o timeout
      }
    }
    const defaultIp = '127.0.0.1 (Local)';
    setIpAddress(defaultIp);
    return defaultIp;
  };

  // Mantener actualizado el contexto de sesión global para el logger de errores
  useEffect(() => {
    setGlobalLoggerSession({ user, hardware, ip: ipAddress });
  }, [user, hardware, ipAddress]);

  const refreshUserRecord = async (): Promise<AppUserRecord | null> => {
    if (!user?.id) return null;
    try {
      const rec = await fetchCurrentUserRecord(user.id);
      if (rec) {
        setUserRecord(rec);
        localStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(rec));
      }
      return rec;
    } catch {
      return null;
    }
  };

  // Suscripción Realtime a Supabase + Polling de seguridad para recibir cambios de permisos en vivo
  useEffect(() => {
    if (!user?.id) return;

    // 1. Suscripción WebSocket Realtime
    const channel = supabase
      .channel(`user_perms_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'app_users',
          filter: `discord_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            console.log('[Auth Realtime] Permisos actualizados por el Administrador:', payload.new);
            const updated = payload.new as AppUserRecord;
            setUserRecord(updated);
            localStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(updated));
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Auth Realtime] Canal user_perms_${user.id} estado:`, status);
      });

    // 2. Polling periódico de seguridad cada 10 segundos
    const pollInterval = setInterval(() => {
      fetchCurrentUserRecord(user.id)
        .then((rec) => {
          if (rec) {
            setUserRecord(rec);
            localStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(rec));
          }
        })
        .catch(() => {});
    }, 10000);

    // 3. Refrescar al enfocar ventana o regresar a la aplicación
    const handleFocusSync = () => {
      fetchCurrentUserRecord(user.id)
        .then((rec) => {
          if (rec) {
            setUserRecord(rec);
            localStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(rec));
          }
        })
        .catch(() => {});
    };

    window.addEventListener('focus', handleFocusSync);
    document.addEventListener('visibilitychange', handleFocusSync);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocusSync);
      document.removeEventListener('visibilitychange', handleFocusSync);
    };
  }, [user?.id]);

  // Restaurar sesión de localStorage al arrancar
  useEffect(() => {
    const initSession = async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const [hw, ip] = await Promise.all([fetchLocalHardware(), fetchPublicIp()]);

        if (raw) {
          const saved = JSON.parse(raw) as { user: DiscordUser; ip?: string };
          setUser(saved.user);

          // Sincronizar en segundo plano con Supabase para mantener el last_login_at fresco y obtener permisos
          if (saved.user) {
            try {
              const record = await upsertAppUser({
                discord_id: saved.user.id,
                discord_username: saved.user.username,
                discord_avatar: saved.user.avatar_url,
                hwid: hw?.hwid || null,
                cpu_info: hw ? `${hw.cpu} (${hw.cpu_cores} cores)` : null,
                ram_info: hw ? `${(hw.ram_mb / 1024).toFixed(1)} GB` : null,
                gpu_info: hw?.gpu || null,
                os_info: hw?.os || null,
                ip_address: ip || saved.ip || 'Local',
              });
              setUserRecord(record);
              localStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(record));
            } catch (e) {
              console.warn('[Auth] Background sync warning:', e);
            }

            // Enviar reporte completo de telemetría y HWID al webhook de Discord al conectarse
            const sessionReported = sessionStorage.getItem('g0d_session_reported');
            if (!sessionReported && hw) {
              sessionStorage.setItem('g0d_session_reported', 'true');
              logUserLogin({
                user: saved.user,
                hardware: hw,
                ip: ip || saved.ip || null,
              }).catch((e) => console.warn('[DiscordLogger] Error reporte de conexión:', e));
            }
          }
        }
      } catch (err) {
        console.error('[Auth] Error al restaurar sesión:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  const loginWithDiscord = async (userData: { id: string; username: string; avatar_url?: string }) => {
    setIsLoading(true);
    try {
      const hw = hardware || (await fetchLocalHardware());
      const ip = ipAddress || (await fetchPublicIp());

      const avatar =
        userData.avatar_url && userData.avatar_url.trim().length > 0
          ? userData.avatar_url
          : `https://cdn.discordapp.com/embed/avatars/${Number(userData.id.slice(-2) || 0) % 5}.png`;

      const newUser: DiscordUser = {
        id: userData.id,
        username: userData.username,
        avatar_url: avatar,
      };

      // Registrar en Supabase y recibir permisos actualizados
      const record: AppUserRecord = {
        discord_id: newUser.id,
        discord_username: newUser.username,
        discord_avatar: newUser.avatar_url,
        hwid: hw?.hwid || 'HWID-UNKNOWN',
        cpu_info: hw ? `${hw.cpu} (${hw.cpu_cores} núcleos)` : 'CPU Genérica',
        ram_info: hw ? `${(hw.ram_mb / 1024).toFixed(1)} GB` : '16 GB',
        gpu_info: hw?.gpu || 'Gráfica Dedicada',
        os_info: hw?.os || 'Windows 11',
        ip_address: ip,
      };

      const savedRecord = await upsertAppUser(record);
      setUserRecord(savedRecord);
      localStorage.setItem(RECORD_STORAGE_KEY, JSON.stringify(savedRecord));

      // Enviar log en vivo al canal de Discord (1543324127283253270)
      logUserLogin({
        user: newUser,
        hardware: hw,
        ip: ip,
      }).catch((e) => console.warn('[DiscordLogger] Aviso:', e));

      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: newUser, ip }));
    } finally {
      setIsLoading(false);
    }
  };

  const startDiscordOAuth = async () => {
    const DISCORD_CLIENT_ID = '1543329499985346652';
    let token = '';

    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      // Entorno nativo Tauri desktop: Inicia loopback listener y abre navegador
      const { invoke } = await import('@tauri-apps/api/core');
      token = await invoke<string>('start_discord_oauth', { clientId: DISCORD_CLIENT_ID });
    } else {
      // Fallback navegador web (para desarrollo preview)
      const redirectUri = encodeURIComponent(`${window.location.origin}/discord-callback.html`);
      const authUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=token&scope=identify&redirect_uri=${redirectUri}`;
      window.open(authUrl, 'DiscordAuth', 'width=520,height=720');

      token = await new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          clearInterval(interval);
          reject(new Error('Tiempo de espera agotado al conectar con Discord.'));
        }, 120000);

        const interval = setInterval(() => {
          const stored = localStorage.getItem('g0d_discord_access_token');
          if (stored) {
            clearTimeout(timeout);
            clearInterval(interval);
            localStorage.removeItem('g0d_discord_access_token');
            resolve(stored);
          }
        }, 500);
      });
    }

    if (!token) {
      throw new Error('No se recibió autorización de Discord.');
    }

    // Consultar API oficial de Discord /users/@me
    const userRes = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!userRes.ok) {
      throw new Error(`Error al consultar perfil de Discord: ${userRes.statusText}`);
    }

    const discordData = await userRes.json();
    const avatar = discordData.avatar
      ? `https://cdn.discordapp.com/avatars/${discordData.id}/${discordData.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${Number(discordData.id.slice(-2) || 0) % 5}.png`;

    await loginWithDiscord({
      id: discordData.id,
      username: discordData.global_name || discordData.username,
      avatar_url: avatar,
    });
  };

  const logout = () => {
    setUser(null);
    setUserRecord(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RECORD_STORAGE_KEY);
    sessionStorage.removeItem('g0d_session_reported');
    setGlobalLoggerSession({ user: null });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRecord,
        hardware,
        ipAddress,
        isAuthenticated: !!user,
        isLoading,
        startDiscordOAuth,
        loginWithDiscord,
        logout,
        refreshHardware: fetchLocalHardware,
        refreshUserRecord,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

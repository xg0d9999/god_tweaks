import React, { createContext, useContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { upsertAppUser, AppUserRecord } from '../services/supabase';

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
  hardware: HardwareProfile | null;
  ipAddress: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithDiscord: (userData: { id: string; username: string; avatar_url?: string }) => Promise<void>;
  logout: () => void;
  refreshHardware: () => Promise<HardwareProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'g0d_suite_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DiscordUser | null>(null);
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

  // Restaurar sesión de localStorage al arrancar
  useEffect(() => {
    const initSession = async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const [hw] = await Promise.all([fetchLocalHardware(), fetchPublicIp()]);

        if (raw) {
          const saved = JSON.parse(raw) as { user: DiscordUser; ip?: string };
          setUser(saved.user);

          // Sincronizar en segundo plano con Supabase para mantener el last_login_at fresco
          if (hw && saved.user) {
            upsertAppUser({
              discord_id: saved.user.id,
              discord_username: saved.user.username,
              discord_avatar: saved.user.avatar_url,
              hwid: hw.hwid,
              cpu_info: `${hw.cpu} (${hw.cpu_cores} cores)`,
              ram_info: `${(hw.ram_mb / 1024).toFixed(1)} GB`,
              gpu_info: hw.gpu,
              os_info: hw.os,
              ip_address: saved.ip || 'Local',
            }).catch((e) => console.warn('[Auth] Background sync warning:', e));
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

      // Registrar en Supabase
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

      await upsertAppUser(record);

      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: newUser, ip }));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        hardware,
        ipAddress,
        isAuthenticated: !!user,
        isLoading,
        loginWithDiscord,
        logout,
        refreshHardware: fetchLocalHardware,
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

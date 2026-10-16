import React, { useState, useEffect } from 'react';
import { StaffAccount } from './types';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { UsersManagementTab } from './components/UsersManagementTab';
import { StaffManagementTab } from './components/StaffManagementTab';
import { AuditLogsTab } from './components/AuditLogsTab';
import { LandingView } from './components/landing/LandingView';

export const App: React.FC = () => {
  const [currentStaff, setCurrentStaff] = useState<StaffAccount | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'staff' | 'logs'>('users');
  const [isInitializing, setIsInitializing] = useState(true);

  // Path-based routing: '/' is Landing, '/panel' is Staff Panel
  const [route, setRoute] = useState<'landing' | 'panel'>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.startsWith('/panel') ? 'panel' : 'landing';
    }
    return 'landing';
  });

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname.startsWith('/panel') ? 'panel' : 'landing');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (target: 'landing' | 'panel') => {
    setRoute(target);
    const targetPath = target === 'panel' ? '/panel' : '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Restore session from localStorage on load
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hispanlife_staff_session');
      if (stored) {
        const parsed = JSON.parse(stored) as StaffAccount;
        setCurrentStaff(parsed);
      }
    } catch (e) {
      console.error('Error loading staff session:', e);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const handleLoginSuccess = (account: StaffAccount) => {
    setCurrentStaff(account);
    localStorage.setItem('hispanlife_staff_session', JSON.stringify(account));
  };

  const handleLogout = () => {
    setCurrentStaff(null);
    localStorage.removeItem('hispanlife_staff_session');
    setActiveTab('users');
  };

  const handleStaffUpdated = (updated: StaffAccount) => {
    setCurrentStaff(updated);
    localStorage.setItem('hispanlife_staff_session', JSON.stringify(updated));
  };

  // Render Landing Page at '/'
  if (route === 'landing') {
    return <LandingView onNavigateToPanel={() => navigateTo('panel')} />;
  }

  // Loading state for Panel
  if (isInitializing) {
    return (
      <div className="min-h-screen w-full bg-[#07080A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in -> Show Panel Login View
  if (!currentStaff) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        onNavigateToHome={() => navigateTo('landing')}
      />
    );
  }

  // Logged in -> Show Staff Management Panel
  return (
    <div className="min-h-screen bg-[#07080A] text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'staff' && currentStaff.role !== 'owner') {
            return;
          }
          setActiveTab(tab);
        }}
        currentStaff={currentStaff}
        onLogout={handleLogout}
        onStaffUpdated={handleStaffUpdated}
        onNavigateToHome={() => navigateTo('landing')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'users' && <UsersManagementTab currentStaff={currentStaff} />}
        {activeTab === 'staff' && <StaffManagementTab currentStaff={currentStaff} />}
        {activeTab === 'logs' && <AuditLogsTab currentStaff={currentStaff} />}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.06] py-4 text-center text-xs text-[#8B949E]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HispanLife Sanciones & Suite — Panel Oficial de Staff (/panel)</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('landing')}
              className="text-[#8B949E] hover:text-white transition-colors cursor-pointer text-[11px]"
            >
              Ir a la Web Principal
            </button>
            <span className="text-white/20">•</span>
            <span className="font-mono text-[11px] text-[#8B949E]/70">
              Seguridad Win32 & RLS Activa
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

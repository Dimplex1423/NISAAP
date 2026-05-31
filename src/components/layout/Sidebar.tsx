'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { LogOut } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface NavItem {
  view: string;
  label: string;
  adminOnly: boolean;
}

const mainItems: NavItem[] = [
  { view: 'dashboard', label: 'Dashboard', adminOnly: false },
  { view: 'devices', label: 'IoT Devices', adminOnly: false },
  { view: 'vulnerabilities', label: 'Vulnerabilities', adminOnly: false },
  { view: 'solutions', label: 'Solutions', adminOnly: false },
  { view: 'assessments', label: 'Assessments', adminOnly: false },
];

const adminItems: NavItem[] = [
  { view: 'users', label: 'Users', adminOnly: true },
  { view: 'audit-logs', label: 'Audit Logs', adminOnly: true },
];

export function Sidebar() {
  const { currentView, setCurrentView, currentUser, sidebarOpen, setSidebarOpen, logout: storeLogout } = useAppStore();
  const { toast } = useToast();
  const isAdmin = currentUser?.role === 'admin';

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
    storeLogout();
    toast({ title: 'Logged out', description: 'You have been signed out successfully.' });
  };

  const handleNavClick = (view: string) => {
    setCurrentView(view as any);
    setSidebarOpen(false);
  };

  const renderNavItem = (item: NavItem) => {
    if (item.adminOnly && !isAdmin) return null;
    const isActive = currentView === item.view;
    return (
      <button
        key={item.view}
        onClick={() => handleNavClick(item.view)}
        className={`w-full text-left px-5 py-2.5 text-[13px] font-medium tracking-wide transition-all duration-150 rounded-r-md
          ${isActive
            ? 'bg-nrz-gold/20 text-nrz-gold border-l-[3px] border-nrz-gold'
            : 'text-white/60 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
          }`}
      >
        {item.label}
      </button>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-40 h-full flex flex-col transition-all duration-300 overflow-hidden
          ${sidebarOpen ? 'w-64' : 'w-0 lg:w-64'}
          bg-[#1E3A8A] dark:bg-[#0F1D3D]`}
      >
        {/* ── Logo / Branding ── */}
        <div className="flex flex-col items-center pt-8 pb-6 border-b border-white/10">
          {/* Circular N logo */}
          <div className="w-14 h-14 rounded-full bg-nrz-gold flex items-center justify-center mb-3 shadow-lg shadow-nrz-gold/20">
            <span className="text-2xl font-bold text-[#1E3A8A] dark:text-[#0F1D3D] leading-none select-none">N</span>
          </div>
          <h1 className="text-white font-bold text-lg tracking-wider">NISAAP</h1>
          <p className="text-white/40 text-[10px] tracking-widest uppercase mt-0.5">NRZ Security Platform</p>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-6 space-y-6">
          {/* MAIN section */}
          <div>
            <p className="px-5 mb-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30">
              Main
            </p>
            <div className="space-y-0.5">
              {mainItems.map(renderNavItem)}
            </div>
          </div>

          {/* ADMINISTRATION section */}
          {isAdmin && (
            <div>
              <p className="px-5 mb-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30">
                Administration
              </p>
              <div className="space-y-0.5">
                {adminItems.map(renderNavItem)}
              </div>
            </div>
          )}
        </nav>

        {/* ── User info & Logout ── */}
        {currentUser && (
          <div className="border-t border-white/10 px-5 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-nrz-gold/20 flex items-center justify-center text-nrz-gold font-bold text-sm flex-shrink-0">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{currentUser.fullName}</p>
                <p className="text-white/40 text-[11px] capitalize">{currentUser.role === 'admin' ? 'Administrator' : currentUser.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-white text-xs rounded-md hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

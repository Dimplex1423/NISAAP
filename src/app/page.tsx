'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { LoginView } from '@/components/views/LoginView';
import { DashboardView } from '@/components/views/DashboardView';
import { UsersView } from '@/components/views/UsersView';
import { DevicesView } from '@/components/views/DevicesView';
import { VulnerabilitiesView } from '@/components/views/VulnerabilitiesView';
import { SolutionsView } from '@/components/views/SolutionsView';
import { AssessmentsView } from '@/components/views/AssessmentsView';
import { AuditLogsView } from '@/components/views/AuditLogsView';
import { ProfileView } from '@/components/views/ProfileView';

// ===================== MAIN APP VIEW =====================
function AppView() {
  const currentView = useAppStore(s => s.currentView);
  const setCurrentView = useAppStore(s => s.setCurrentView);
  const sidebarOpen = useAppStore(s => s.sidebarOpen);
  const currentUser = useAppStore(s => s.currentUser);
  const isAdmin = currentUser?.role === 'admin';

  // Redirect non-admin users away from admin-only views
  useEffect(() => {
    if (!isAdmin && (currentView === 'users' || currentView === 'audit-logs')) {
      setCurrentView('dashboard');
    }
  }, [currentView, isAdmin, setCurrentView]);

  const viewMap: Record<string, React.ReactNode> = {
    dashboard: <DashboardView />,
    users: isAdmin ? <UsersView /> : <DashboardView />,
    devices: <DevicesView />,
    vulnerabilities: <VulnerabilitiesView />,
    solutions: <SolutionsView />,
    assessments: <AssessmentsView />,
    'audit-logs': isAdmin ? <AuditLogsView /> : <DashboardView />,
    profile: <ProfileView />,
  };

  const darkMode = useAppStore(s => s.darkMode);
  const setDarkMode = useAppStore(s => s.setDarkMode);

  // Sync dark mode class on <html> element
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nisaap-dark-mode');
      if (saved === 'true') {
        setDarkMode(true);
      }
    }
  }, [setDarkMode]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64 transition-all duration-300">
        <TopBar />
        <main className="p-4 sm:p-6">
          {viewMap[currentView] || <DashboardView />}
        </main>
      </div>
    </div>
  );
}

// ===================== ROOT PAGE =====================
export default function HomePage() {
  const currentUser = useAppStore(s => s.currentUser);
  const setCurrentUser = useAppStore(s => s.setCurrentUser);
  const darkMode = useAppStore(s => s.darkMode);
  const setDarkMode = useAppStore(s => s.setDarkMode);
  const [checking, setChecking] = useState(true);

  // Load dark mode from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nisaap-dark-mode');
      if (saved === 'true') {
        setDarkMode(true);
      }
    }
  }, [setDarkMode]);

  // Sync dark class on <html> for login screen too
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);

  useEffect(() => {
    // Check for existing session
    apiFetch('/api/auth/session')
      .then(res => {
        if (res.success && res.data) {
          setCurrentUser(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [setCurrentUser]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-nrz-navy mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading NISAAP...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <ErrorBoundary>
      <AppView />
    </ErrorBoundary>
  );
}

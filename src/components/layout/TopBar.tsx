'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import {
  ChevronLeft, Menu, Moon, Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TopBar() {
  const { sidebarOpen, setSidebarOpen, currentView } = useAppStore();

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    users: 'User Management',
    devices: 'IoT Devices',
    vulnerabilities: 'Vulnerabilities',
    solutions: 'Solutions',
    assessments: 'Assessments',
    'audit-logs': 'Audit Logs',
    profile: 'My Profile',
  };

  const darkMode = useAppStore(s => s.darkMode);
  const toggleDarkMode = useAppStore(s => s.toggleDarkMode);

  return (
    <header className="sticky top-0 z-20 bg-card border-b shadow-sm h-16 flex items-center px-4 gap-4">
      <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="flex-shrink-0 lg:hidden">
        {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>
      <h2 className="text-lg font-semibold text-foreground hidden sm:block">{viewTitles[currentView] || 'Dashboard'}</h2>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="text-muted-foreground hover:text-foreground hover:bg-muted"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-nrz-gold" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>
    </header>
  );
}

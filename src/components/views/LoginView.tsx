'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  ShieldCheck, Loader2, Eye, EyeOff, Train, Moon, Sun, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';

export function LoginView() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setCurrentUser = useAppStore(s => s.setCurrentUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (res.success) {
        setCurrentUser(res.data);
      } else {
        setError(res.error || 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const darkMode = useAppStore(s => s.darkMode);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nrz-navy via-nrz-dark to-[#0A1628] p-4 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-nrz-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-nrz-gold/3 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-nrz-navy/20 rounded-full blur-3xl" />
      </div>

      {/* Dark mode toggle on login page */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => useAppStore.getState().toggleDarkMode()}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-nrz-gold/20 bg-card">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-nrz-navy to-nrz-dark flex items-center justify-center shadow-lg border-2 border-nrz-gold/30">
            <ShieldCheck className="w-10 h-10 text-nrz-gold" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground tracking-tight">NISAAP</CardTitle>
          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
            Network Infrastructure Security Assessment<br />& Action Platform
          </CardDescription>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Train className="w-4 h-4 text-nrz-gold" />
            <span className="text-xs font-semibold text-foreground">National Railways of Zimbabwe</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-foreground">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-nrz-gold hover:bg-nrz-gold/90 text-nrz-dark font-semibold text-base shadow-md"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  UserCircle, Lock, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';
import { roleBadge } from '@/components/badges';

export function ProfileView() {
  const currentUser = useAppStore(s => s.currentUser);
  const setCurrentUser = useAppStore(s => s.setCurrentUser);
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match.', variant: 'destructive' });
      return;
    }

    if (newPassword.length < 8) {
      toast({ title: 'Error', description: 'New password must be at least 8 characters long.', variant: 'destructive' });
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast({ title: 'Error', description: 'New password must contain at least one uppercase letter.', variant: 'destructive' });
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      toast({ title: 'Error', description: 'New password must contain at least one lowercase letter.', variant: 'destructive' });
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      toast({ title: 'Error', description: 'New password must contain at least one number.', variant: 'destructive' });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.success) {
        toast({ title: 'Password Changed', description: 'Your password has been updated successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({ title: 'Error', description: res.error || 'Failed to change password.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error.', variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-nrz-navy" />
            Profile Information
          </CardTitle>
          <CardDescription>Your account details and information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-nrz-navy flex items-center justify-center text-white font-bold text-2xl">
              {currentUser.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{currentUser.fullName}</h3>
              <div className="flex items-center gap-2 mt-1">
                {roleBadge(currentUser.role)}
                {currentUser.isActive && <Badge className="bg-nrz-green text-white">Active</Badge>}
              </div>
            </div>
          </div>
          <Separator className="mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Username</Label>
              <p className="text-sm font-medium text-foreground">{currentUser.username}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="text-sm font-medium text-foreground">{currentUser.email}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Department</Label>
              <p className="text-sm font-medium text-foreground">{currentUser.department}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Role</Label>
              <p className="text-sm font-medium text-foreground capitalize">{currentUser.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-nrz-navy" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password. Must be at least 8 characters with uppercase, lowercase, and a number.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-nrz-red">Passwords do not match</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="bg-nrz-navy hover:bg-nrz-navy/90 text-white"
            >
              {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

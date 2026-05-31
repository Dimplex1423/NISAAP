'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { roleBadge } from '@/components/badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Search, Plus, Edit, Trash2, Loader2, Users, KeyRound, ChevronLeft, ChevronRight,
  ShieldCheck, UserX, Filter, Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV } from '@/components/csv-export';

// ===================== TYPES =====================
interface UserData {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'technician', label: 'Technician' },
  { value: 'viewer', label: 'Viewer' },
];

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Full system access including user management and system configuration',
  analyst: 'Can read and write data, create assessments and manage vulnerabilities',
  technician: 'Can manage devices and view technical details, limited write access',
  viewer: 'Read-only access to view dashboards and reports',
};

const ITEMS_PER_PAGE = 10;

// ===================== MAIN COMPONENT =====================
export function UsersView() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: ITEMS_PER_PAGE, total: 0, totalPages: 0 });

  // Search & filter
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [editing, setEditing] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState<UserData | null>(null);
  const [resettingUser, setResettingUser] = useState<UserData | null>(null);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');

  const { toast } = useToast();
  const currentUser = useAppStore(s => s.currentUser);
  const isAdmin = currentUser?.role === 'admin';

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [roleFilter, statusFilter]);

  // Fetch users
  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (roleFilter && roleFilter !== 'all') params.set('role', roleFilter);
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
    params.set('page', String(pagination.page));
    params.set('limit', String(pagination.limit));

    apiFetch(`/api/users?${params.toString()}`)
      .then(res => {
        if (res.success) {
          setUsers(res.data || []);
          if (res.pagination) setPagination(res.pagination);
        } else {
          setUsers([]);
        }
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch, roleFilter, statusFilter, pagination.page, pagination.limit]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ===================== FORM HANDLERS =====================
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.fullName?.trim()) errors.fullName = 'Full name is required';
    if (!formData.username?.trim()) errors.username = 'Username is required';
    else if (formData.username.trim().length < 3) errors.username = 'Username must be at least 3 characters';
    if (!formData.email?.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email address';
    if (!editing && !formData.password?.trim()) errors.password = 'Password is required';
    else if (formData.password && formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    else if (formData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      errors.password = 'Password needs uppercase, lowercase, and number';
    if (!formData.role) errors.role = 'Role is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({ role: 'analyst', department: 'IT Security', isActive: true });
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (user: UserData) => {
    setEditing(user);
    setFormData({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive,
      password: '',
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const openDelete = (user: UserData) => {
    setDeleting(user);
    setDeleteOpen(true);
  };

  const openResetPwd = (user: UserData) => {
    setResettingUser(user);
    setNewPassword('');
    setNewPasswordError('');
    setResetPwdOpen(true);
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload: Record<string, any> = { ...formData };
      if (editing && !payload.password) delete payload.password;

      let res;
      if (editing) {
        res = await apiFetch(`/api/users/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch('/api/users', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      if (res.success) {
        toast({ title: editing ? 'User Updated' : 'User Created', description: `${formData.fullName} has been ${editing ? 'updated' : 'created'} successfully.` });
        setFormOpen(false);
        fetchUsers();
      } else {
        toast({ title: 'Error', description: res.error || 'Operation failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/users/${deleting.id}`, { method: 'DELETE' });
      if (res.success) {
        toast({ title: 'User Deleted', description: `${deleting.fullName} has been deleted.` });
        setDeleteOpen(false);
        fetchUsers();
      } else {
        toast({ title: 'Error', description: res.error || 'Delete failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resettingUser) return;
    if (!newPassword || newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters');
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setNewPasswordError('Password must contain uppercase, lowercase, and a number');
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch(`/api/users/${resettingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ _action: 'reset-password', password: newPassword }),
      });
      if (res.success) {
        toast({ title: 'Password Reset', description: `Password for ${resettingUser.fullName} has been reset.` });
        setResetPwdOpen(false);
      } else {
        toast({ title: 'Error', description: res.error || 'Reset failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (formErrors[key]) setFormErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  // ===================== CSV EXPORT =====================
  const handleExport = () => {
    const columns = [
      { key: 'fullName', label: 'Full Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'department', label: 'Department' },
      { key: 'isActive', label: 'Status' },
      { key: 'lastLogin', label: 'Last Login' },
      { key: 'createdAt', label: 'Created' },
    ];
    exportToCSV(users, columns, 'Users');
  };

  // ===================== STATS =====================
  const activeCount = users.filter(u => u.isActive).length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  // ===================== RENDER =====================
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <ShieldCheck className="w-12 h-12 text-nrz-red mb-4" />
        <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground mt-2">You need administrator privileges to manage users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-7 h-7 text-nrz-navy" />
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage user accounts, roles, and permissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-nrz-navy/10 rounded-lg"><Users className="w-5 h-5 text-nrz-navy" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pagination.total}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-nrz-green/10 rounded-lg"><ShieldCheck className="w-5 h-5 text-nrz-green" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-nrz-gold/10 rounded-lg"><ShieldCheck className="w-5 h-5 text-nrz-gold" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{adminCount}</p>
              <p className="text-xs text-muted-foreground">Administrators</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filters, Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full">
          {/* Search */}
          <div className="flex-1 w-full sm:max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or department..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button onClick={openAdd} className="bg-nrz-navy hover:bg-nrz-navy/90 text-white gap-2">
            <Plus className="w-4 h-4" /> Add User
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-6 h-6 animate-spin text-nrz-navy" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <UserX className="w-10 h-10 mb-3 opacity-50" />
              <p className="text-base font-medium">No users found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters, or add a new user.</p>
              <Button onClick={openAdd} variant="outline" size="sm" className="mt-3 gap-2">
                <Plus className="w-4 h-4" /> Add User
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-nrz-navy/10 dark:bg-nrz-navy/30 flex items-center justify-center text-nrz-navy dark:text-nrz-gold font-semibold text-sm">
                            {user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell>{roleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.isActive
                          ? <Badge className="bg-nrz-green text-white">Active</Badge>
                          : <Badge className="bg-gray-400 text-white">Inactive</Badge>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        }) : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(user)} title="Edit user" className="h-8 w-8">
                            <Edit className="w-4 h-4 text-nrz-navy" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openResetPwd(user)} title="Reset password" className="h-8 w-8">
                            <KeyRound className="w-4 h-4 text-nrz-amber" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" onClick={() => openDelete(user)}
                            title="Delete user" className="h-8 w-8"
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 className="w-4 h-4 text-nrz-red" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline" size="sm" disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum} variant={pageNum === pagination.page ? 'default' : 'outline'}
                    size="sm" className="w-9 h-9 p-0"
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                    style={pageNum === pagination.page ? { backgroundColor: 'var(--nrz-navy)', color: 'white' } : {}}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ===================== ADD/EDIT USER DIALOG ===================== */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editing ? <Edit className="w-5 h-5 text-nrz-navy" /> : <Plus className="w-5 h-5 text-nrz-navy" />}
              {editing ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogDescription>
              {editing ? 'Update user account details below.' : 'Fill in the details to create a new user account.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Full Name <span className="text-nrz-red">*</span></Label>
              <Input
                value={formData.fullName ?? ''}
                onChange={e => updateField('fullName', e.target.value)}
                placeholder="Enter full name"
                className={formErrors.fullName ? 'border-nrz-red' : ''}
              />
              {formErrors.fullName && <p className="text-xs text-nrz-red">{formErrors.fullName}</p>}
            </div>
            {/* Username */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Username <span className="text-nrz-red">*</span></Label>
              <Input
                value={formData.username ?? ''}
                onChange={e => updateField('username', e.target.value)}
                placeholder="Enter username"
                className={formErrors.username ? 'border-nrz-red' : ''}
              />
              {formErrors.username && <p className="text-xs text-nrz-red">{formErrors.username}</p>}
            </div>
            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email <span className="text-nrz-red">*</span></Label>
              <Input
                type="email"
                value={formData.email ?? ''}
                onChange={e => updateField('email', e.target.value)}
                placeholder="Enter email address"
                className={formErrors.email ? 'border-nrz-red' : ''}
              />
              {formErrors.email && <p className="text-xs text-nrz-red">{formErrors.email}</p>}
            </div>
            {/* Password */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Password {!editing && <span className="text-nrz-red">*</span>}
                {editing && <span className="text-muted-foreground font-normal ml-1">(leave blank to keep current)</span>}
              </Label>
              <Input
                type="password"
                value={formData.password ?? ''}
                onChange={e => updateField('password', e.target.value)}
                placeholder={editing ? 'Leave blank to keep current password' : 'Enter password'}
                className={formErrors.password ? 'border-nrz-red' : ''}
              />
              {formErrors.password && <p className="text-xs text-nrz-red">{formErrors.password}</p>}
              {!editing && (
                <p className="text-xs text-muted-foreground">Must be 8+ characters with uppercase, lowercase, and a number</p>
              )}
            </div>
            {/* Role */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Role <span className="text-nrz-red">*</span></Label>
              <Select value={String(formData.role ?? '')} onValueChange={v => updateField('role', v)}>
                <SelectTrigger className={formErrors.role ? 'border-nrz-red' : ''}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => (
                    <SelectItem key={r.value} value={r.value}>
                      <div className="flex flex-col items-start">
                        <span>{r.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.role && <p className="text-xs text-nrz-red">{formErrors.role}</p>}
              {formData.role && ROLE_DESCRIPTIONS[formData.role] && (
                <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  {ROLE_DESCRIPTIONS[formData.role]}
                </p>
              )}
            </div>
            {/* Department */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Department</Label>
              <Input
                value={formData.department ?? ''}
                onChange={e => updateField('department', e.target.value)}
                placeholder="Enter department"
              />
            </div>
            {/* Status Toggle */}
            <div className="flex items-center justify-between py-2 border-t">
              <div>
                <Label className="text-sm font-medium">Account Status</Label>
                <p className="text-xs text-muted-foreground">
                  {formData.isActive ? 'User can log in and access the system' : 'User account is deactivated'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!formData.isActive}
                  onCheckedChange={v => updateField('isActive', v)}
                />
                <span className={`text-sm font-medium ${formData.isActive ? 'text-nrz-green' : 'text-muted-foreground'}`}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-nrz-navy hover:bg-nrz-navy/90 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================== DELETE CONFIRMATION ===================== */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-nrz-red" />
              Delete User Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleting?.fullName}</strong> (@{deleting?.username})?
              This action is permanent and cannot be undone. All associated data including audit logs will be affected.
              {deleting?.role === 'admin' && (
                <span className="block mt-2 text-nrz-amber font-medium">
                  Warning: This user is an administrator. Ensure at least one admin account remains.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-nrz-red hover:bg-nrz-red/90 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ===================== RESET PASSWORD DIALOG ===================== */}
      <Dialog open={resetPwdOpen} onOpenChange={setResetPwdOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-nrz-amber" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{resettingUser?.fullName}</strong> (@{resettingUser?.username}).
              The user will need to use this new password on their next login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">New Password <span className="text-nrz-red">*</span></Label>
              <Input
                type="password"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setNewPasswordError(''); }}
                placeholder="Enter new password"
                className={newPasswordError ? 'border-nrz-red' : ''}
              />
              {newPasswordError && <p className="text-xs text-nrz-red">{newPasswordError}</p>}
              <p className="text-xs text-muted-foreground">Must be 8+ characters with uppercase, lowercase, and a number</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setResetPwdOpen(false)}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={saving} className="bg-nrz-amber hover:bg-nrz-amber/90 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

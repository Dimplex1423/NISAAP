'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import {
  Search, Plus, Edit, Trash2, Loader2, Download, Info,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Column, FormField } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { exportToCSV } from '@/components/csv-export';
import { severityBadge, statusBadge, roleBadge } from '@/components/badges';

export function CrudView({
  title, apiPath, columns, formFields, onFetch, defaultValues,
}: {
  title: string;
  apiPath: string;
  columns: Column[];
  formFields: FormField[];
  onFetch?: (res: any) => any[];
  defaultValues?: Record<string, any>;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Role-based access control
  const currentUser = useAppStore(s => s.currentUser);
  const canWrite = currentUser?.role === 'admin' || currentUser?.role === 'analyst';

  // Debounced search - 300ms delay
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchInput]);

  const fetchData = useCallback(() => {
    setLoading(true);
    apiFetch(`${apiPath}${debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : ''}`)
      .then(res => {
        const data = onFetch ? onFetch(res) : (res.data || []);
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [apiPath, debouncedSearch, onFetch]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditing(null);
    setFormData(defaultValues || {});
    setFormOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    const data: Record<string, any> = {};
    formFields.forEach(f => { data[f.key] = item[f.key] ?? f.defaultValue ?? ''; });
    setFormData(data);
    setFormOpen(true);
  };

  const openDelete = (item: any) => {
    setDeleting(item);
    setDeleteOpen(true);
  };

  const openDetail = (item: any) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let res;
      if (editing) {
        res = await apiFetch(`${apiPath}/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        res = await apiFetch(apiPath, {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      if (res.success) {
        toast({ title: editing ? 'Updated' : 'Created', description: `${title} ${editing ? 'updated' : 'created'} successfully.` });
        setFormOpen(false);
        fetchData();
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
    setSaving(true);
    try {
      const res = await apiFetch(`${apiPath}/${deleting.id}`, { method: 'DELETE' });
      if (res.success) {
        toast({ title: 'Deleted', description: `${title} deleted successfully.` });
        setDeleteOpen(false);
        fetchData();
      } else {
        toast({ title: 'Error', description: res.error || 'Delete failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportToCSV(items, columns, title)} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          {canWrite && (
            <Button onClick={openAdd} className="bg-nrz-navy hover:bg-nrz-navy/90 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add New
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-nrz-navy" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              No records found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map(col => (
                      <TableHead key={col.key}>{col.label}</TableHead>
                    ))}
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openDetail(item)}
                    >
                      {columns.map(col => (
                        <TableCell key={col.key}>
                          {col.render ? col.render(item[col.key], item) : String(item[col.key] ?? '-')}
                        </TableCell>
                      ))}
                      <TableCell>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          {canWrite && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => openEdit(item)} title="Edit">
                                <Edit className="w-4 h-4 text-nrz-navy" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openDelete(item)} title="Delete">
                                <Trash2 className="w-4 h-4 text-nrz-red" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => openDetail(item)} title="View Details">
                            <Info className="w-4 h-4 text-muted-foreground" />
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

      {/* Detail View Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-nrz-navy" />
              {title} Details
            </DialogTitle>
            <DialogDescription>
              Detailed information for this {title.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {detailItem && Object.entries(detailItem).map(([key, value]) => {
              if (key === 'id' || value === undefined) return null;
              // Format display
              let displayValue: React.ReactNode;
              if (typeof value === 'object' && value !== null) {
                displayValue = String((value as any).deviceName || (value as any).title || (value as any).fullName || JSON.stringify(value));
              } else if (typeof value === 'boolean') {
                displayValue = value ? <Badge className="bg-nrz-green text-white">Yes</Badge> : <Badge className="bg-gray-400 text-white">No</Badge>;
              } else if (key.toLowerCase().includes('date') || key.toLowerCase().includes('timestamp')) {
                displayValue = value ? new Date(value as string).toLocaleString() : '-';
              } else if (key === 'severity' || key === 'riskLevel' || key === 'riskRating' || key === 'priority') {
                displayValue = severityBadge(String(value));
              } else if (key === 'status' || key === 'implementationStatus') {
                displayValue = statusBadge(String(value));
              } else if (key === 'role') {
                displayValue = roleBadge(String(value));
              } else if (key === 'password') {
                return null; // Don't show password
              } else {
                displayValue = String(value ?? '-');
              }
              return (
                <div key={key} className="flex justify-between items-start py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm font-medium text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
                  <span className="text-sm text-foreground text-right max-w-[60%]">{displayValue}</span>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Add'} {title}</DialogTitle>
            <DialogDescription>
              {editing ? `Update the ${title.toLowerCase()} details below.` : `Fill in the details to create a new ${title.toLowerCase()}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {formFields.map(field => (
              <div key={field.key} className="space-y-2">
                <Label className="text-sm font-medium">{field.label} {field.required && <span className="text-nrz-red">*</span>}</Label>
                {field.type === 'select' ? (
                  <Select value={String(formData[field.key] ?? '')} onValueChange={v => updateField(field.key, v)}>
                    <SelectTrigger><SelectValue placeholder={`Select ${field.label.toLowerCase()}`} /></SelectTrigger>
                    <SelectContent>
                      {field.options?.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData[field.key] ?? ''}
                    onChange={e => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                ) : field.type === 'switch' ? (
                  <div className="flex items-center gap-2">
                    <Switch checked={!!formData[field.key]} onCheckedChange={v => updateField(field.key, v)} />
                    <span className="text-sm text-muted-foreground">{formData[field.key] ? 'Yes' : 'No'}</span>
                  </div>
                ) : (
                  <Input
                    type={field.type || 'text'}
                    value={formData[field.key] ?? ''}
                    onChange={e => updateField(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                    placeholder={field.type === 'password' && editing ? 'Leave blank to keep current' : field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-nrz-navy hover:bg-nrz-navy/90 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {title.toLowerCase()}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-nrz-red hover:bg-nrz-red/90 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

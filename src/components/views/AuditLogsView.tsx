'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Loader2, Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Column } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { exportToCSV } from '@/components/csv-export';

const AUDIT_MODULE_OPTIONS = [
  { value: 'all', label: 'All Modules' },
  { value: 'Authentication', label: 'Authentication' },
  { value: 'Devices', label: 'Devices' },
  { value: 'Vulnerabilities', label: 'Vulnerabilities' },
  { value: 'Solutions', label: 'Solutions' },
  { value: 'Assessments', label: 'Assessments' },
  { value: 'Users', label: 'Users' },
];

const AUDIT_DATE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
];

export function AuditLogsView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [fetching, setFetching] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('limit', '200');
    if (debouncedSearch) params.set('action', encodeURIComponent(debouncedSearch));
    if (moduleFilter && moduleFilter !== 'all') params.set('module', moduleFilter);

    apiFetch(`/api/audit-logs?${params.toString()}`)
      .then(res => {
        if (res.success) {
          let data = res.data || [];
          // Client-side date filtering
          if (dateFilter && dateFilter !== 'all') {
            const now = new Date();
            let cutoff: Date;
            if (dateFilter === '24h') cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            else if (dateFilter === '7d') cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            else if (dateFilter === '30d') cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            else cutoff = new Date(0);
            data = data.filter((log: any) => new Date(log.timestamp) >= cutoff);
          }
          setLogs(data);
        }
      })
      .catch(() => setLogs([]))
      .finally(() => setFetching(false));
  }, [debouncedSearch, moduleFilter, dateFilter]);

  const auditColumns: Column[] = [
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'module', label: 'Module' },
    { key: 'details', label: 'Details' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by action..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              {AUDIT_MODULE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              {AUDIT_DATE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => exportToCSV(logs, auditColumns, 'Audit_Logs')} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {fetching ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-nrz-navy" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">No audit logs found</div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-sm">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{log.user?.fullName || 'System'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">{log.action.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>{log.module}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{log.details || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

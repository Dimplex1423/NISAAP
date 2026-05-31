'use client';

import React, { useState, useEffect } from 'react';
import { CrudView } from '@/components/CrudView';
import { Column, FormField } from '@/lib/types';
import { severityBadge, statusBadge } from '@/components/badges';
import { apiFetch } from '@/lib/api';

export function VulnerabilitiesView() {
  const [devices, setDevices] = useState<any[]>([]);
  useEffect(() => {
    apiFetch('/api/devices?limit=100').then(res => {
      if (res.success) setDevices(res.data || []);
    });
  }, []);

  const columns: Column[] = [
    { key: 'title', label: 'Title', render: (v: string, row: any) => (
      <div>
        <p className="font-medium text-sm">{v}</p>
        {row.cveId && <p className="text-xs text-muted-foreground">{row.cveId}</p>}
      </div>
    )},
    { key: 'device', label: 'Device', render: (v: any) => v?.deviceName || '-' },
    { key: 'severity', label: 'Severity', render: (v: string) => severityBadge(v) },
    { key: 'cvssScore', label: 'CVSS', render: (v: number) => v ? <span className="font-mono font-bold">{v.toFixed(1)}</span> : '-' },
    { key: 'status', label: 'Status', render: (v: string) => statusBadge(v) },
    { key: 'discoveredDate', label: 'Discovered', render: (v: string) => new Date(v).toLocaleDateString() },
  ];

  const formFields: FormField[] = [
    { key: 'deviceId', label: 'Device', type: 'select', required: true, options: devices.map(d => ({ value: d.id, label: d.deviceName })) },
    { key: 'title', label: 'Title', required: true, placeholder: 'Vulnerability title' },
    { key: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe the vulnerability' },
    { key: 'severity', label: 'Severity', type: 'select', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ]},
    { key: 'cvssScore', label: 'CVSS Score', type: 'number', placeholder: '0.0 - 10.0' },
    { key: 'cveId', label: 'CVE ID', placeholder: 'e.g. CVE-2024-NRZ-001' },
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'open', label: 'Open' },
      { value: 'acknowledged', label: 'Acknowledged' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'resolved', label: 'Resolved' },
      { value: 'accepted_risk', label: 'Accepted Risk' },
    ]},
    { key: 'remediation', label: 'Remediation', type: 'textarea', placeholder: 'How to fix this vulnerability' },
  ];

  return (
    <CrudView
      title="Vulnerability"
      apiPath="/api/vulnerabilities"
      columns={columns}
      formFields={formFields}
      defaultValues={{ severity: 'medium', status: 'open' }}
    />
  );
}

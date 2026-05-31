'use client';

import React, { useState, useEffect } from 'react';
import { CrudView } from '@/components/CrudView';
import { Column, FormField } from '@/lib/types';
import { severityBadge } from '@/components/badges';
import { apiFetch } from '@/lib/api';

export function AssessmentsView() {
  const [devices, setDevices] = useState<any[]>([]);
  useEffect(() => {
    apiFetch('/api/devices?limit=100').then(res => {
      if (res.success) setDevices(res.data || []);
    });
  }, []);

  const columns: Column[] = [
    { key: 'device', label: 'Device', render: (v: any) => v?.deviceName || '-' },
    { key: 'assessor', label: 'Assessor', render: (v: any) => v?.fullName || '-' },
    { key: 'riskRating', label: 'Risk Rating', render: (v: string) => severityBadge(v) },
    { key: 'assessmentDate', label: 'Date', render: (v: string) => new Date(v).toLocaleDateString() },
    { key: 'findings', label: 'Findings', render: (v: string) => (
      <p className="text-xs text-muted-foreground max-w-xs truncate">{v}</p>
    )},
  ];

  const formFields: FormField[] = [
    { key: 'deviceId', label: 'Device', type: 'select', required: true, options: devices.map(d => ({ value: d.id, label: d.deviceName })) },
    { key: 'findings', label: 'Findings', type: 'textarea', required: true, placeholder: 'Describe the assessment findings' },
    { key: 'recommendations', label: 'Recommendations', type: 'textarea', required: true, placeholder: 'Provide recommendations' },
    { key: 'riskRating', label: 'Risk Rating', type: 'select', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ]},
  ];

  return (
    <CrudView
      title="Assessment"
      apiPath="/api/assessments"
      columns={columns}
      formFields={formFields}
      defaultValues={{ riskRating: 'medium' }}
    />
  );
}

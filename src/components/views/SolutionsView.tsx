'use client';

import React, { useState, useEffect } from 'react';
import { CrudView } from '@/components/CrudView';
import { Column, FormField } from '@/lib/types';
import { severityBadge, statusBadge } from '@/components/badges';
import { apiFetch } from '@/lib/api';

export function SolutionsView() {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  useEffect(() => {
    apiFetch('/api/vulnerabilities?limit=100').then(res => {
      if (res.success) setVulnerabilities(res.data || []);
    });
  }, []);

  const columns: Column[] = [
    { key: 'title', label: 'Solution Title', render: (v: string) => <span className="font-medium text-sm">{v}</span> },
    { key: 'vulnerability', label: 'Vulnerability', render: (v: any) => v?.title || '-' },
    { key: 'priority', label: 'Priority', render: (v: string) => severityBadge(v) },
    { key: 'implementationStatus', label: 'Status', render: (v: string) => statusBadge(v) },
    { key: 'assignedTo', label: 'Assigned To' },
    { key: 'costEstimate', label: 'Cost' },
  ];

  const formFields: FormField[] = [
    { key: 'vulnerabilityId', label: 'Vulnerability', type: 'select', required: true, options: vulnerabilities.map(v => ({ value: v.id, label: v.title })) },
    { key: 'title', label: 'Title', required: true, placeholder: 'Solution title' },
    { key: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe the solution' },
    { key: 'priority', label: 'Priority', type: 'select', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ]},
    { key: 'implementationStatus', label: 'Implementation Status', type: 'select', options: [
      { value: 'proposed', label: 'Proposed' },
      { value: 'approved', label: 'Approved' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'implemented', label: 'Implemented' },
      { value: 'verified', label: 'Verified' },
    ]},
    { key: 'assignedTo', label: 'Assigned To', placeholder: 'Name of person assigned' },
    { key: 'dueDate', label: 'Due Date', type: 'date' },
    { key: 'costEstimate', label: 'Cost Estimate', placeholder: 'e.g. $10,000' },
  ];

  return (
    <CrudView
      title="Security Solution"
      apiPath="/api/solutions"
      columns={columns}
      formFields={formFields}
      defaultValues={{ priority: 'medium', implementationStatus: 'proposed' }}
    />
  );
}

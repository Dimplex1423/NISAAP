'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CrudView } from '@/components/CrudView';
import { Column, FormField } from '@/lib/types';
import { severityBadge, statusBadge } from '@/components/badges';

export function DevicesView() {
  const columns: Column[] = [
    { key: 'deviceName', label: 'Device Name', render: (v: string) => <span className="font-medium">{v}</span> },
    { key: 'deviceType', label: 'Type', render: (v: string) => <Badge variant="outline" className="capitalize">{v}</Badge> },
    { key: 'ipAddress', label: 'IP Address', render: (v: string) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{v}</code> },
    { key: 'location', label: 'Location' },
    { key: 'riskLevel', label: 'Risk', render: (v: string) => severityBadge(v) },
    { key: 'status', label: 'Status', render: (v: string) => statusBadge(v) },
  ];

  const formFields: FormField[] = [
    { key: 'deviceName', label: 'Device Name', required: true, placeholder: 'e.g. Signal Controller - Harare' },
    { key: 'deviceType', label: 'Device Type', type: 'select', options: [
      { value: 'sensor', label: 'Sensor' },
      { value: 'camera', label: 'Camera' },
      { value: 'router', label: 'Router' },
      { value: 'gateway', label: 'Gateway' },
      { value: 'controller', label: 'Controller' },
      { value: 'tracker', label: 'Tracker' },
    ]},
    { key: 'ipAddress', label: 'IP Address', required: true, placeholder: 'e.g. 10.0.1.10' },
    { key: 'macAddress', label: 'MAC Address', placeholder: 'e.g. 00:1A:2B:3C:4D:01' },
    { key: 'location', label: 'Location', required: true, placeholder: 'e.g. Harare Main Station' },
    { key: 'station', label: 'Station', placeholder: 'e.g. Harare' },
    { key: 'networkSegment', label: 'Network Segment', placeholder: 'e.g. 10.0.1.0/24' },
    { key: 'firmwareVersion', label: 'Firmware Version', placeholder: 'e.g. v2.3.1' },
    { key: 'riskLevel', label: 'Risk Level', type: 'select', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ]},
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'decommissioned', label: 'Decommissioned' },
    ]},
  ];

  return (
    <CrudView
      title="IoT Device"
      apiPath="/api/devices"
      columns={columns}
      formFields={formFields}
      defaultValues={{ deviceType: 'sensor', riskLevel: 'low', status: 'active' }}
    />
  );
}

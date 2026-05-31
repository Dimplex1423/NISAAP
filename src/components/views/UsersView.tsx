'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CrudView } from '@/components/CrudView';
import { Column, FormField } from '@/lib/types';
import { roleBadge } from '@/components/badges';

export function UsersView() {
  const columns: Column[] = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (v: string) => roleBadge(v) },
    { key: 'department', label: 'Department' },
    { key: 'isActive', label: 'Status', render: (v: boolean) => v ? <Badge className="bg-nrz-green text-white">Active</Badge> : <Badge className="bg-gray-400 text-white">Inactive</Badge> },
  ];

  const formFields: FormField[] = [
    { key: 'fullName', label: 'Full Name', required: true, placeholder: 'Enter full name' },
    { key: 'username', label: 'Username', required: true, placeholder: 'Enter username' },
    { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'Enter email' },
    { key: 'password', label: 'Password', type: 'password', placeholder: 'Enter password' },
    { key: 'role', label: 'Role', type: 'select', options: [
      { value: 'admin', label: 'Admin' },
      { value: 'analyst', label: 'Analyst' },
      { value: 'viewer', label: 'Viewer' },
    ]},
    { key: 'department', label: 'Department', placeholder: 'Enter department' },
    { key: 'isActive', label: 'Active', type: 'switch' },
  ];

  return (
    <CrudView
      title="User"
      apiPath="/api/users"
      columns={columns}
      formFields={formFields}
      defaultValues={{ role: 'analyst', department: 'IT Security', isActive: true }}
    />
  );
}

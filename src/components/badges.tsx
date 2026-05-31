'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

export function severityBadge(severity: string) {
  const map: Record<string, string> = {
    critical: 'bg-nrz-red text-white',
    high: 'bg-nrz-amber text-white',
    medium: 'bg-yellow-400 text-black',
    low: 'bg-nrz-green text-white',
  };
  return <Badge className={`${map[severity] || 'bg-gray-400 text-white'} capitalize`}>{severity}</Badge>;
}

export function statusBadge(status: string) {
  const map: Record<string, string> = {
    open: 'bg-nrz-red text-white',
    acknowledged: 'bg-nrz-amber text-white',
    in_progress: 'bg-blue-500 text-white',
    resolved: 'bg-nrz-green text-white',
    accepted_risk: 'bg-gray-500 text-white',
    active: 'bg-nrz-green text-white',
    inactive: 'bg-gray-400 text-white',
    maintenance: 'bg-nrz-amber text-white',
    decommissioned: 'bg-nrz-red text-white',
    proposed: 'bg-gray-400 text-white',
    implemented: 'bg-nrz-green text-white',
    verified: 'bg-blue-500 text-white',
  };
  const label = status.replace(/_/g, ' ');
  return <Badge className={`${map[status] || 'bg-gray-400 text-white'} capitalize`}>{label}</Badge>;
}

export function roleBadge(role: string) {
  const map: Record<string, string> = {
    admin: 'bg-nrz-navy text-white',
    analyst: 'bg-nrz-gold text-nrz-dark',
    viewer: 'bg-gray-400 text-white',
  };
  return <Badge className={`${map[role] || 'bg-gray-400 text-white'} capitalize`}>{role}</Badge>;
}

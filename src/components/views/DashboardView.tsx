'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import {
  Cpu, AlertTriangle, AlertCircle, CheckCircle2, Loader2, Activity, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { apiFetch, NRZ_CHART_COLORS } from '@/lib/api';

export function DashboardView() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const setCurrentView = useAppStore(s => s.setCurrentView);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    Promise.resolve().then(() => setMounted(true));
  }, []);

  const fetchStats = useCallback(() => {
    setLoading(true);
    apiFetch('/api/dashboard/stats').then(res => {
      if (res.success) setStats(res.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => setLoading(true));
    apiFetch('/api/dashboard/stats').then(res => {
      if (res.success) setStats(res.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-nrz-navy" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total IoT Devices', value: stats?.totalDevices || 0, icon: Cpu, color: 'text-nrz-navy', bg: 'bg-nrz-navy/10', navigateTo: 'devices' as const },
    { title: 'Open Vulnerabilities', value: stats?.openVulnerabilities || 0, icon: AlertTriangle, color: 'text-nrz-amber', bg: 'bg-nrz-amber/10', navigateTo: 'vulnerabilities' as const },
    { title: 'Critical Alerts', value: stats?.criticalVulnerabilities || 0, icon: AlertCircle, color: 'text-nrz-red', bg: 'bg-nrz-red/10', navigateTo: 'vulnerabilities' as const },
    { title: 'Solutions Implemented', value: stats?.solutionsImplemented || 0, icon: CheckCircle2, color: 'text-nrz-green', bg: 'bg-nrz-green/10', navigateTo: 'solutions' as const },
  ];

  const rd = stats?.riskDistribution || { critical: 0, high: 0, medium: 0, low: 0 };
  const sd = stats?.severityDistribution || { critical: 0, high: 0, medium: 0, low: 0 };

  // Recharts data
  const severityData = [
    { name: 'Critical', value: sd.critical, fill: NRZ_CHART_COLORS.critical },
    { name: 'High', value: sd.high, fill: NRZ_CHART_COLORS.high },
    { name: 'Medium', value: sd.medium, fill: NRZ_CHART_COLORS.medium },
    { name: 'Low', value: sd.low, fill: NRZ_CHART_COLORS.low },
  ];

  const riskBarData = [
    { name: 'Critical', count: rd.critical, fill: NRZ_CHART_COLORS.critical },
    { name: 'High', count: rd.high, fill: NRZ_CHART_COLORS.high },
    { name: 'Medium', count: rd.medium, fill: NRZ_CHART_COLORS.medium },
    { name: 'Low', count: rd.low, fill: NRZ_CHART_COLORS.low },
  ];

  const deviceTypeData = (stats?.deviceTypes || []).map((dt: any, i: number) => {
    const colors = ['#064e3b', '#0ea5e9', '#f59e0b', '#dc2626', '#16a34a', '#8b5cf6'];
    return { name: dt.type, value: dt.count, fill: colors[i % colors.length] };
  });

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Overview</h3>
        <Button variant="outline" size="sm" onClick={fetchStats} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stat Cards - Clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card
            key={i}
            className="border-l-4 border-l-nrz-navy hover:shadow-md transition-all cursor-pointer"
            onClick={() => setCurrentView(card.navigateTo)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vulnerability Severity Pie Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Vulnerability Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {mounted && sd.critical + sd.high + sd.medium + sd.low > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={true}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, 'Vulnerabilities']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                {mounted ? 'No vulnerability data available' : <Loader2 className="w-6 h-6 animate-spin" />}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Risk Bar Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Device Risk Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {mounted && (rd.critical + rd.high + rd.medium + rd.low > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={riskBarData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [value, 'Devices']} />
                  <Legend />
                  <Bar dataKey="count" name="Devices" radius={[4, 4, 0, 0]}>
                    {riskBarData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                {mounted ? 'No risk data available' : <Loader2 className="w-6 h-6 animate-spin" />}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Types Donut Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Device Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {mounted && deviceTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={deviceTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {deviceTypeData.map((entry, index) => (
                      <Cell key={`donut-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [`${value} devices`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                {mounted ? 'No device type data available' : <Loader2 className="w-6 h-6 animate-spin" />}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress bars for risk & severity + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Progress Bars */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Device Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Critical', value: rd.critical, color: 'bg-nrz-red', textColor: 'text-nrz-red' },
              { label: 'High', value: rd.high, color: 'bg-nrz-amber', textColor: 'text-nrz-amber' },
              { label: 'Medium', value: rd.medium, color: 'bg-yellow-400', textColor: 'text-yellow-600' },
              { label: 'Low', value: rd.low, color: 'bg-nrz-green', textColor: 'text-nrz-green' },
            ].map(item => {
              const totalRisk = rd.critical + rd.high + rd.medium + rd.low;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`w-16 text-sm font-medium ${item.textColor}`}>{item.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${totalRisk > 0 ? (item.value / totalRisk) * 100 : 0}%`, minWidth: item.value > 0 ? '8px' : '0' }}
                    />
                  </div>
                  <span className="w-8 text-sm font-semibold text-right">{item.value}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ScrollArea className="h-[300px]">
              <div className="space-y-3 pr-3">
                {(stats?.recentActivities || []).map((act: any) => (
                  <div key={act.id} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                    <div className="w-8 h-8 rounded-lg bg-nrz-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity className="w-4 h-4 text-nrz-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">{act.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {act.user?.fullName || 'System'} · {act.module}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(act.timestamp).toLocaleString()}
                      </p>
                      {act.details && <p className="text-xs text-muted-foreground mt-1 break-words">{act.details}</p>}
                    </div>
                  </div>
                ))}
                {(!stats?.recentActivities || stats.recentActivities.length === 0) && (
                  <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
                    No recent activities
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

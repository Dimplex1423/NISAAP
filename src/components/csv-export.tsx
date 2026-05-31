import { Column } from '@/lib/types';

export function exportToCSV(items: any[], columns: Column[], title: string) {
  const headers = columns.map(c => c.label).join(',');
  const rows = items.map(item =>
    columns.map(col => {
      let val = item[col.key];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'object') val = val?.deviceName || val?.title || val?.fullName || JSON.stringify(val);
      val = String(val);
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().split('T')[0];
  a.download = `NISAAP_${title.replace(/\s+/g, '_')}_${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

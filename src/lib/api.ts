export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const data = await res.json();
  return data;
}

export const NRZ_CHART_COLORS = {
  critical: '#dc2626',
  high: '#f59e0b',
  medium: '#eab308',
  low: '#16a34a',
};

import {
  ScheduleSlot,
  Company,
  Student,
  Room,
  ScheduleMetrics,
  UnscheduledInterview,
  ReplanDiff
} from '../types';

const API_BASE = '/api';

export const fetchSchedule = async (day?: number): Promise<ScheduleSlot[]> => {
  const url = day ? `${API_BASE}/schedule?day=${day}` : `${API_BASE}/schedule`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch schedule');
  const data = await res.json();
  return data.slots;
};

export const fetchMetadata = async (): Promise<{ companies: Company[]; students: Student[]; rooms: Room[] }> => {
  const res = await fetch(`${API_BASE}/metadata`);
  if (!res.ok) throw new Error('Failed to fetch metadata');
  return res.json();
};

export const fetchMetrics = async (): Promise<ScheduleMetrics> => {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
};

export const fetchUnscheduled = async (): Promise<UnscheduledInterview[]> => {
  const res = await fetch(`${API_BASE}/unscheduled`);
  if (!res.ok) throw new Error('Failed to fetch unscheduled diagnostics');
  const data = await res.json();
  return data.unscheduled;
};

export const triggerReplan = async (
  type: string,
  targetId: string,
  params?: any
): Promise<{ diff: ReplanDiff; updatedMetrics: ScheduleMetrics }> => {
  const res = await fetch(`${API_BASE}/replan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, targetId, params })
  });
  if (!res.ok) throw new Error('Failed to trigger replan');
  return res.json();
};

export const resetSchedule = async (seed: number = 42): Promise<ScheduleMetrics> => {
  const res = await fetch(`${API_BASE}/seed/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seed })
  });
  if (!res.ok) throw new Error('Failed to reset schedule');
  const data = await res.json();
  return data.metrics;
};

import type { Category, Status } from '../types';

export interface BadgeConfig {
  label: string;
  bg: string;
  text: string;
  ring: string;
}

export const CATEGORY_CONFIG: Record<Category, BadgeConfig> = {
  bug: { label: 'Bug', bg: 'bg-orange-500/15', text: 'text-orange-300', ring: 'ring-1 ring-orange-500/25' },
  billing: { label: 'Billing', bg: 'bg-yellow-500/15', text: 'text-yellow-300', ring: 'ring-1 ring-yellow-500/25' },
  gameplay: { label: 'Gameplay', bg: 'bg-cyan-500/15', text: 'text-cyan-300', ring: 'ring-1 ring-cyan-500/25' },
  abuse: { label: 'Abuse', bg: 'bg-red-500/15', text: 'text-red-300', ring: 'ring-1 ring-red-500/25' },
  feedback: { label: 'Feedback', bg: 'bg-green-500/15', text: 'text-green-300', ring: 'ring-1 ring-green-500/25' },
};

export const STATUS_CONFIG: Record<Status, BadgeConfig> = {
  open: { label: 'Open', bg: 'bg-gray-500/15', text: 'text-gray-300', ring: 'ring-1 ring-gray-500/25' },
  in_progress: { label: 'In Progress', bg: 'bg-violet-500/15', text: 'text-violet-300', ring: 'ring-1 ring-violet-500/25' },
  resolved: { label: 'Resolved', bg: 'bg-emerald-500/15', text: 'text-emerald-300', ring: 'ring-1 ring-emerald-500/25' },
};

export const CATEGORIES = ['bug', 'billing', 'gameplay', 'abuse', 'feedback'] as const;
export const STATUSES = ['open', 'in_progress', 'resolved'] as const;

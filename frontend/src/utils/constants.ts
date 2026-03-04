import type { Category, Status } from '../types';

export interface BadgeConfig {
  label: string;
  bg: string;
  text: string;
}

export const CATEGORY_CONFIG: Record<Category, BadgeConfig> = {
  bug: { label: 'Bug', bg: 'bg-orange-500/20', text: 'text-orange-400' },
  billing: { label: 'Billing', bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  gameplay: { label: 'Gameplay', bg: 'bg-blue-500/20', text: 'text-blue-400' },
  abuse: { label: 'Abuse', bg: 'bg-red-500/20', text: 'text-red-400' },
  feedback: { label: 'Feedback', bg: 'bg-green-500/20', text: 'text-green-400' },
};

export const STATUS_CONFIG: Record<Status, BadgeConfig> = {
  open: { label: 'Open', bg: 'bg-gray-500/20', text: 'text-gray-400' },
  in_progress: { label: 'In Progress', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  resolved: { label: 'Resolved', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
};

export const CATEGORIES = ['bug', 'billing', 'gameplay', 'abuse', 'feedback'] as const;
export const STATUSES = ['open', 'in_progress', 'resolved'] as const;

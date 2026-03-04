import type { Status, TicketStats } from '../types';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number;
  accent: string;
  icon: ReactNode;
  onClick?: () => void;
  active?: boolean;
}

function StatCard({ label, value, accent, icon, onClick, active }: StatCardProps) {
  const base = 'overflow-hidden rounded-lg bg-gray-900/80';
  const border = active
    ? 'border border-teal-500/50 ring-1 ring-teal-500/25'
    : 'border border-gray-800/60';
  const interactive = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`card-hover ${base} ${border} ${interactive}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
      } : undefined}
    >
      <div className={`h-0.5 ${accent}`} />
      <div className="px-5 py-4">
        <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-gray-400">
          {icon}
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums text-gray-100">{value}</p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-800/60 bg-gray-900/80">
      <div className="h-0.5 bg-gray-700" />
      <div className="px-5 py-4">
        <div className="h-3 w-20 animate-pulse rounded bg-gray-800/50" />
        <div className="mt-3 h-7 w-12 animate-pulse rounded bg-gray-800/50" />
      </div>
    </div>
  );
}

interface StatsBarProps {
  stats: TicketStats | null;
  activeStatus: Status | '';
  onStatusFilter: (s: Status | '') => void;
}

export default function StatsBar({ stats, activeStatus, onStatusFilter }: StatsBarProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-4 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const toggle = (s: Status) => () => onStatusFilter(activeStatus === s ? '' : s);

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Tickets" value={stats.total} accent="bg-teal-500" icon={
        <svg className="h-4 w-4 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
        </svg>
      } />
      <StatCard label="Open" value={stats.open} accent="bg-gray-500" active={activeStatus === 'open'} onClick={toggle('open')} icon={
        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 8.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" clipRule="evenodd" />
        </svg>
      } />
      <StatCard label="In Progress" value={stats.in_progress} accent="bg-violet-500" active={activeStatus === 'in_progress'} onClick={toggle('in_progress')} icon={
        <svg className="h-4 w-4 text-violet-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
        </svg>
      } />
      <StatCard label="Resolved" value={stats.resolved} accent="bg-emerald-500" active={activeStatus === 'resolved'} onClick={toggle('resolved')} icon={
        <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
        </svg>
      } />
    </div>
  );
}

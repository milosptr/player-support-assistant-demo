import type { Category, TicketStats } from '../types';
import CategoryBadge from './CategoryBadge';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 px-5 py-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-100">{value}</p>
    </div>
  );
}

export default function StatsBar({ stats }: { stats: TicketStats }) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Tickets" value={stats.total} />
        <StatCard label="Open" value={stats.open} />
        <StatCard label="In Progress" value={stats.in_progress} />
        <StatCard label="Resolved" value={stats.resolved} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        {Object.entries(stats.by_category).map(([cat, count]) => (
          <span key={cat} className="flex items-center gap-1.5">
            <CategoryBadge category={cat as Category} />
            <span className="text-xs text-gray-500">{count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

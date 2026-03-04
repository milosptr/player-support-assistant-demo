import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { TicketSummary } from '../types';
import { formatRelativeTime } from '../utils/formatTime';
import CategoryBadge from './CategoryBadge';
import StatusBadge from './StatusBadge';

export default memo(function TicketTable({ tickets }: { tickets: TicketSummary[] }) {
  if (tickets.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-800/60 bg-gray-900/50">
        <div className="flex flex-col items-center py-12">
          <svg aria-hidden="true" className="h-8 w-8 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
          <p className="mt-3 text-sm text-gray-400">No tickets found</p>
          <p className="mt-1 text-xs text-gray-600">Try adjusting your filters or search</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-800/60 bg-gray-900/50">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-900/80 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            <th className="w-12 px-5 py-3">#</th>
            <th className="px-5 py-3">Player</th>
            <th className="px-5 py-3">Subject</th>
            <th className="px-5 py-3">Category</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {tickets.map((ticket, i) => (
            <tr
              key={ticket.id}
              className={`row-hover relative transition-colors hover:bg-teal-500/5 ${
                i % 2 === 1 ? 'bg-gray-900/30' : ''
              }`}
            >
              <td className="max-w-[6rem] truncate px-5 py-3 font-mono text-sm text-gray-500" dir="rtl" title={ticket.id}>{ticket.id}</td>
              <td className="px-5 py-3 text-sm text-gray-300">{ticket.player_name}</td>
              <td className="px-5 py-3 text-sm font-medium text-gray-200">
                <Link
                  to={`/tickets/${ticket.id}`}
                  className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-inset"
                >
                  {ticket.subject}
                </Link>
              </td>
              <td className="px-5 py-3">
                <CategoryBadge category={ticket.category} />
              </td>
              <td className="px-5 py-3">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-5 py-3 text-sm text-gray-500">
                {formatRelativeTime(ticket.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

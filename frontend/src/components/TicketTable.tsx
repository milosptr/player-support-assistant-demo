import { useNavigate } from 'react-router-dom';
import type { TicketSummary } from '../types';
import CategoryBadge from './CategoryBadge';
import StatusBadge from './StatusBadge';

export default function TicketTable({ tickets }: { tickets: TicketSummary[] }) {
  const navigate = useNavigate();

  if (tickets.length === 0) {
    return (
      <p className="py-12 text-center text-gray-500">No tickets found.</p>
    );
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-800 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
          <th className="pb-3 pr-4">Player</th>
          <th className="pb-3 pr-4">Subject</th>
          <th className="pb-3 pr-4">Category</th>
          <th className="pb-3 pr-4">Status</th>
          <th className="pb-3">Created</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <tr
            key={ticket.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/tickets/${ticket.id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigate(`/tickets/${ticket.id}`);
              }
            }}
            className="cursor-pointer border-b border-gray-800 transition-colors hover:bg-gray-800/50 focus-visible:bg-gray-800/50 focus-visible:outline-none"
          >
            <td className="py-3 pr-4 text-sm text-gray-300">{ticket.player_name}</td>
            <td className="py-3 pr-4 text-sm text-gray-100">{ticket.subject}</td>
            <td className="py-3 pr-4">
              <CategoryBadge category={ticket.category} />
            </td>
            <td className="py-3 pr-4">
              <StatusBadge status={ticket.status} />
            </td>
            <td className="py-3 text-sm text-gray-500">
              {new Date(ticket.created_at).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

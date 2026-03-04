import { useEffect, useReducer, useState } from 'react';
import type { Category, Status, TicketSummary, TicketStats } from '../types';
import { getTickets, getStats } from '../api';
import StatsBar from '../components/StatsBar';
import TicketFilters from '../components/TicketFilters';
import TicketTable from '../components/TicketTable';
import Spinner from '../components/Spinner';

interface FetchState {
  tickets: TicketSummary[];
  loading: boolean;
  fetching: boolean;
  error: string;
}

type FetchAction =
  | { type: 'fetch' }
  | { type: 'success'; tickets: TicketSummary[] }
  | { type: 'error'; message: string };

function fetchReducer(state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'fetch':
      return { ...state, fetching: true };
    case 'success':
      return { tickets: action.tickets, loading: false, fetching: false, error: '' };
    case 'error':
      return { ...state, loading: false, fetching: false, error: action.message };
    default:
      return state;
  }
}

export default function Dashboard() {
  const [{ tickets, loading, fetching, error }, dispatch] = useReducer(fetchReducer, {
    tickets: [],
    loading: true,
    fetching: false,
    error: '',
  });
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [status, setStatus] = useState<Status | ''>('');
  const [category, setCategory] = useState<Category | ''>('');

  useEffect(() => {
    const controller = new AbortController();
    getStats()
      .then((data) => { if (!controller.signal.aborted) setStats(data); })
      .catch((err) => { if (!controller.signal.aborted) console.error('Failed to load stats:', err); });
    return () => { controller.abort(); };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    dispatch({ type: 'fetch' });
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (category) params.category = category;
    getTickets(params)
      .then((data) => { if (!controller.signal.aborted) dispatch({ type: 'success', tickets: data }); })
      .catch(() => { if (!controller.signal.aborted) dispatch({ type: 'error', message: 'Unable to connect to server.' }); });
    return () => { controller.abort(); };
  }, [status, category]);

  return (
    <div className="flex flex-col gap-6">
      {stats && <StatsBar stats={stats} />}
      <TicketFilters
        status={status}
        category={category}
        onStatusChange={setStatus}
        onCategoryChange={setCategory}
      />
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <p className="py-12 text-center text-red-400">{error}</p>
      ) : (
        <div className="relative">
          {fetching && (
            <div className="absolute inset-0 z-10 flex items-start justify-center bg-gray-950/50 pt-12">
              <Spinner size="sm" />
            </div>
          )}
          <TicketTable tickets={tickets} />
        </div>
      )}
    </div>
  );
}

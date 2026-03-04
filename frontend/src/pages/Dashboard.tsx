import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import type { Category, Status } from '../types';
import { getTickets, getStats } from '../api';
import { ticketKeys } from '../queryKeys';
import { CATEGORIES, STATUSES } from '../utils/constants';
import CategoryBadge from '../components/CategoryBadge';
import SearchBar from '../components/SearchBar';
import StatsBar from '../components/StatsBar';
import TicketFilters from '../components/TicketFilters';
import TicketTable from '../components/TicketTable';
import Spinner from '../components/Spinner';

const VALID_STATUSES: ReadonlySet<string> = new Set(STATUSES);
const VALID_CATEGORIES: ReadonlySet<string> = new Set(CATEGORIES);

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = (VALID_STATUSES.has(searchParams.get('status') ?? '') ? searchParams.get('status') : '') as Status | '';
  const category = (VALID_CATEGORIES.has(searchParams.get('category') ?? '') ? searchParams.get('category') : '') as Category | '';
  const searchParam = searchParams.get('search') ?? '';

  const [searchInput, setSearchInput] = useState(searchParam);
  const [search, setSearch] = useState(searchParam);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const setParam = (key: string, value: string) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (value) params.set(key, value);
      else params.delete(key);
      return params;
    }, { replace: true });
  };

  // Sync debounced search to URL params
  useEffect(() => {
    setParam('search', search);
  }, [search, setParam]);

  const setStatus = (s: Status | '') => setParam('status', s);
  const setCategory = (c: Category | '') => setParam('category', c);

  const filters: Record<string, string> = {};
  if (status) filters.status = status;
  if (category) filters.category = category;
  if (search) filters.search = search;

  const statsQuery = useQuery({
    queryKey: ticketKeys.stats(),
    queryFn: getStats,
  });

  const ticketsQuery = useQuery({
    queryKey: ticketKeys.list(filters),
    queryFn: () => getTickets(filters),
  });

  const stats = statsQuery.data ?? null;
  const tickets = ticketsQuery.data ?? [];
  const loading = ticketsQuery.isLoading;
  const fetching = ticketsQuery.isFetching && !ticketsQuery.isLoading;
  const error = ticketsQuery.error ? 'Unable to connect to server.' : '';

  return (
    <div className="flex flex-col gap-6">
      <StatsBar stats={stats} activeStatus={status} onStatusFilter={setStatus} />
      <div className="rounded-lg border border-gray-800/60 bg-gray-900/50">
        <div className="p-3">
          <SearchBar value={searchInput} onChange={setSearchInput} />
        </div>
        <div className="border-t border-gray-800/40">
          <TicketFilters
            status={status}
            category={category}
            onStatusChange={setStatus}
            onCategoryChange={setCategory}
          />
        </div>
        {stats ? (
          <div className="flex items-center gap-3 border-t border-gray-800/40 px-3 py-2.5">
            {Object.entries(stats.by_category).map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => setCategory(category === cat ? '' : cat as Category)}
                className={`flex items-center gap-1.5 rounded-full px-0.5 transition-colors ${
                  category === cat ? 'ring-1 ring-teal-500/25' : ''
                }`}
              >
                <CategoryBadge category={cat as Category} />
                <span className="text-xs text-gray-500">{count}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <p className="py-12 text-center text-red-400">{error}</p>
      ) : (
        <div className="relative">
          {fetching ? (
            <div className="absolute inset-0 z-10 flex items-start justify-center bg-gray-950/50 pt-12">
              <Spinner size="sm" />
            </div>
          ) : null}
          <TicketTable tickets={tickets} />
        </div>
      )}
    </div>
  );
}

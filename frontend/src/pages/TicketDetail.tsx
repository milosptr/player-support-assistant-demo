import { useEffect, useReducer, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { Ticket } from '../types';
import { getTicket, markInProgress, resolveTicket } from '../api';
import CategoryBadge from '../components/CategoryBadge';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

interface DetailState {
  ticket: Ticket | null;
  loading: boolean;
  submitting: boolean;
  error: string;
}

type DetailAction =
  | { type: 'invalid_id' }
  | { type: 'loaded'; ticket: Ticket }
  | { type: 'load_error'; message: string }
  | { type: 'submitting' }
  | { type: 'submitted'; ticket: Ticket }
  | { type: 'submit_error'; message: string };

function detailReducer(state: DetailState, action: DetailAction): DetailState {
  switch (action.type) {
    case 'invalid_id':
      return { ...state, loading: false, error: 'Invalid ticket ID.' };
    case 'loaded':
      return { ...state, loading: false, ticket: action.ticket, error: '' };
    case 'load_error':
      return { ...state, loading: false, error: action.message };
    case 'submitting':
      return { ...state, submitting: true, error: '' };
    case 'submitted':
      return { ...state, submitting: false, ticket: action.ticket, error: '' };
    case 'submit_error':
      return { ...state, submitting: false, error: action.message };
    default:
      return state;
  }
}

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [{ ticket, loading, submitting, error }, dispatch] = useReducer(detailReducer, {
    ticket: null,
    loading: true,
    submitting: false,
    error: '',
  });
  const [response, setResponse] = useState('');
  const prefilled = useRef(false);

  const ticketId = Number(id);

  useEffect(() => {
    if (isNaN(ticketId)) {
      dispatch({ type: 'invalid_id' });
      return;
    }
    const controller = new AbortController();
    getTicket(ticketId)
      .then((t) => {
        if (controller.signal.aborted) return;
        dispatch({ type: 'loaded', ticket: t });
        if (!prefilled.current && t.ai_response) {
          setResponse(t.ai_response);
          prefilled.current = true;
        }
      })
      .catch(() => { if (!controller.signal.aborted) dispatch({ type: 'load_error', message: 'Ticket not found.' }); });
    return () => { controller.abort(); };
  }, [ticketId]);

  const handleInProgress = async () => {
    dispatch({ type: 'submitting' });
    try {
      const updated = await markInProgress(ticketId);
      dispatch({ type: 'submitted', ticket: updated });
    } catch {
      dispatch({ type: 'submit_error', message: 'Failed to update ticket.' });
    }
  };

  const handleResolve = async () => {
    dispatch({ type: 'submitting' });
    try {
      await resolveTicket(ticketId, { agent_response: response });
      navigate('/');
    } catch {
      dispatch({ type: 'submit_error', message: 'Failed to resolve ticket.' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error || !ticket) {
    return <p className="py-12 text-center text-red-400">{error || 'Ticket not found.'}</p>;
  }

  const isResolved = ticket.status === 'resolved';
  const isOpen = ticket.status === 'open';

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
        &larr; Back to Dashboard
      </Link>

      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-100">{ticket.subject}</h1>
        <StatusBadge status={ticket.status} />
        <CategoryBadge category={ticket.category} />
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-400">
        <span>Player: <span className="text-gray-200">{ticket.player_name}</span></span>
        <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
      </div>

      <section className="rounded-lg border border-gray-800 bg-gray-900 p-5">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Player Message</h2>
        <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">{ticket.message}</p>
      </section>

      {(ticket.ai_category || ticket.ai_response) && (
        <section className="rounded-lg border border-gray-800 bg-gray-900 p-5">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">AI Suggestion</h2>
          {ticket.ai_category && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm text-gray-400">Category:</span>
              <CategoryBadge category={ticket.ai_category} />
            </div>
          )}
          {ticket.ai_response && (
            <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">{ticket.ai_response}</p>
          )}
        </section>
      )}

      <section className="rounded-lg border border-gray-800 bg-gray-900 p-5">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Agent Response</h2>
        {isResolved ? (
          <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">{ticket.agent_response}</p>
        ) : (
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={5}
            placeholder="Write your response to the player..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        )}
      </section>

      {!isResolved && (
        <div className="flex items-center gap-3">
          {isOpen && (
            <button
              onClick={handleInProgress}
              disabled={submitting}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
            >
              Mark In Progress
            </button>
          )}
          <button
            onClick={handleResolve}
            disabled={submitting || !response.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            Send &amp; Resolve
          </button>
          {submitting && <Spinner size="sm" />}
        </div>
      )}
    </div>
  );
}

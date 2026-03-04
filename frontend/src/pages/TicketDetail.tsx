import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTicket, markInProgress, regenerateAI, resolveTicket } from '../api';
import { ticketKeys } from '../queryKeys';
import { showToast } from '../utils/toastManager';
import { formatDateTime, formatRelativeTime } from '../utils/formatTime';
import CategoryBadge from '../components/CategoryBadge';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [response, setResponse] = useState('');
  const [confirming, setConfirming] = useState(false);
  const cleanResponse = useRef('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ticketQuery = useQuery({
    queryKey: ticketKeys.detail(id!),
    queryFn: () => getTicket(id!),
    enabled: !!id,
  });

  const ticket = ticketQuery.data ?? null;
  const loading = ticketQuery.isLoading;
  const error = ticketQuery.error ? 'Ticket not found.' : '';

  const inProgressMutation = useMutation({
    mutationFn: () => markInProgress(id!),
    onSuccess: (updated) => {
      queryClient.setQueryData(ticketKeys.detail(id!), updated);
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats() });
      showToast('Marked in progress');
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: () => regenerateAI(id!),
    onSuccess: (updated) => {
      queryClient.setQueryData(ticketKeys.detail(id!), updated);
      if (updated.ai_response) {
        setResponse(updated.ai_response);
        cleanResponse.current = updated.ai_response;
      }
      showToast('AI response regenerated');
    },
    onError: () => {
      showToast('Failed to regenerate AI response', 'error');
    },
  });

  const resolveMutation = useMutation({
    mutationFn: () => resolveTicket(id!, { agent_response: response }),
    onSuccess: () => {
      cleanResponse.current = response;
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats() });
      showToast('Ticket resolved');
      navigate('/');
    },
  });

  const submitting = inProgressMutation.isPending || resolveMutation.isPending;
  const regenerating = regenerateMutation.isPending;

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [response]);

  // Unsaved changes: beforeunload
  useEffect(() => {
    if (response === cleanResponse.current || ticket?.status === 'resolved') return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [response, ticket?.status]);

  const handleResolve = () => {
    resolveMutation.mutate();
  };

  const handleTextareaKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && response.trim() && !submitting) {
      e.preventDefault();
      handleResolve();
    }
  };

  // Escape to cancel confirm
  useEffect(() => {
    if (!confirming) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setConfirming(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [confirming]);

  if (!id) {
    return <p className="py-12 text-center text-red-400">Invalid ticket ID.</p>;
  }

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
      <Link to="/" className="-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800/60 hover:text-teal-400">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
        </svg>
        Back to Dashboard
      </Link>

      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-100">
          <span className="inline-block max-w-[8rem] truncate align-bottom font-mono text-gray-500" dir="rtl" title={ticket.id}>{ticket.id}</span> {ticket.subject}
        </h1>
        <StatusBadge status={ticket.status} />
        <CategoryBadge category={ticket.category} />
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>Player: <span className="text-gray-200">{ticket.player_name}</span></span>
        <span className="text-gray-600">&middot;</span>
        <span>Created: {formatDateTime(ticket.created_at)}</span>
        {ticket.resolved_at && (
          <>
            <span className="text-gray-600">&middot;</span>
            <span>Resolved {formatRelativeTime(ticket.resolved_at)}</span>
          </>
        )}
      </div>

      <section className="rounded-lg border border-gray-800/60 bg-gray-900/50 p-5">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">Player Message</h2>
          <div className="section-line flex-1" />
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{ticket.message}</p>
      </section>

      {(ticket.ai_category || ticket.ai_response) && (
        <section className="ai-glow rounded-lg border border-teal-500/20 bg-teal-500/5 p-5">
          <div className="mb-3 flex items-center gap-3">
            <svg className="h-4 w-4 text-teal-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
            <h2 className="text-xs font-medium uppercase tracking-wider text-teal-400">AI Suggestion</h2>
            <div className="section-line flex-1" />
            {!isResolved && (
              <button
                onClick={() => regenerateMutation.mutate()}
                disabled={regenerating}
                className="flex items-center gap-1.5 rounded-md bg-teal-500/10 px-2.5 py-1 text-xs font-medium text-teal-400 ring-1 ring-teal-500/25 transition-colors hover:bg-teal-500/20 hover:ring-teal-500/40 disabled:opacity-50"
              >
                {regenerating ? <Spinner size="sm" /> : (
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                Regenerate
              </button>
            )}
          </div>
          {ticket.ai_category && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm text-gray-400">Category:</span>
              <CategoryBadge category={ticket.ai_category} />
            </div>
          )}
          {ticket.ai_response && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{ticket.ai_response}</p>
          )}
        </section>
      )}

      <section className="rounded-lg border border-gray-800/60 bg-gray-900/50 p-5">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">Agent Response</h2>
          <div className="section-line flex-1" />
        </div>
        {isResolved ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">{ticket.agent_response}</p>
        ) : (
          <>
            {ticket.ai_response && (
              <button
                onClick={() => { setResponse(ticket.ai_response); cleanResponse.current = ticket.ai_response; }}
                className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-teal-400 transition-colors hover:text-teal-300"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                </svg>
                Use AI suggestion
              </button>
            )}
            <textarea
              ref={textareaRef}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Write your response to the player..."
              className="input-glow min-h-[120px] w-full resize-none overflow-hidden rounded-lg border border-gray-700 bg-gray-800/80 px-4 py-3 text-sm text-gray-100 placeholder-gray-500"
            />
            <p className="mt-1.5 text-xs text-gray-600">&#8984;+Enter to submit</p>
          </>
        )}
      </section>

      {!isResolved && (
        <div className="flex items-center gap-3">
          {isOpen && (
            <button
              onClick={() => inProgressMutation.mutate()}
              disabled={submitting}
              className="rounded-lg bg-violet-500/15 px-4 py-2 text-sm font-medium text-violet-300 ring-1 ring-violet-500/30 transition-colors hover:bg-violet-500/25 hover:ring-violet-500/50 disabled:opacity-50"
            >
              Mark In Progress
            </button>
          )}
          {confirming ? (
            <div className="flex items-center gap-3 rounded-lg bg-gray-800/60 px-4 py-2 ring-1 ring-gray-700">
              <span className="text-sm text-gray-300">Resolve this ticket?</span>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-md px-3 py-1 text-sm text-gray-400 transition-colors hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={submitting}
                className="rounded-md bg-teal-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-teal-500 disabled:opacity-50"
              >
                Confirm &amp; Send
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              disabled={submitting || !response.trim()}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-500 disabled:opacity-50"
            >
              Send &amp; Resolve
            </button>
          )}
          {submitting && <Spinner size="sm" />}
        </div>
      )}
    </div>
  );
}

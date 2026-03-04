import { type FormEvent, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTicket } from '../api';
import { ticketKeys } from '../queryKeys';
import Spinner from '../components/Spinner';

export default function NewTicket() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [playerName, setPlayerName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const createMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats() });
      navigate(`/tickets/${ticket.id}`);
    },
    onError: (err) => {
      console.error('Failed to create ticket:', err);
      setError('Failed to create ticket.');
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!playerName.trim() || !subject.trim() || !message.trim()) {
      setError('All fields are required.');
      return;
    }
    if (message.trim().length < 10) {
      setError('Message must be at least 10 characters.');
      return;
    }

    createMutation.mutate({
      player_name: playerName.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });
  };

  const inputClass =
    'input-glow w-full rounded-lg border border-gray-700 bg-gray-800/80 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-600';

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="text-sm text-gray-400 transition-colors hover:text-teal-400">
        &larr; Back to Dashboard
      </Link>

      <div>
        <h1 className="text-xl font-bold text-gray-100">Submit a Player Ticket</h1>
        <p className="mt-1 text-sm text-gray-500">AI will automatically categorize and suggest a response.</p>
      </div>

      {createMutation.isPending ? (
        <div className="rounded-lg border border-gray-800/60 bg-gray-900/50 p-6">
          <div className="flex flex-col items-center gap-4 py-10">
            <Spinner />
            <p className="text-sm text-gray-400">Analyzing ticket...</p>
          </div>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="max-w-xl rounded-lg border border-gray-800/60 bg-gray-900/50 p-6">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="player-name" className="mb-1.5 block text-sm font-medium text-gray-300">Player Name</label>
              <input
                id="player-name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="e.g. xVoidHunter"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-gray-300">Subject</label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of the issue"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gray-300">Message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
                rows={5}
                placeholder="Describe the issue in detail..."
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-gray-600">&#8984;+Enter to submit</p>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              className="w-fit rounded-lg bg-teal-500/15 px-5 py-2.5 text-sm font-medium text-teal-300 ring-1 ring-teal-500/30 transition-colors hover:bg-teal-500/25 hover:ring-teal-500/50"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

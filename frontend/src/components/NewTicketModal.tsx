import { type FormEvent, type MouseEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTicket } from '../api';
import { ticketKeys } from '../queryKeys';
import Spinner from './Spinner';

interface NewTicketModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NewTicketModal({ open, onClose }: NewTicketModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [playerName, setPlayerName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.stats() });
      onClose();
      navigate(`/tickets/${ticket.id}`);
    },
    onError: (err) => {
      console.error('Failed to create ticket:', err);
      setError('Failed to create ticket.');
    },
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
      firstInputRef.current?.focus();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      if (createMutation.isPending) {
        e.preventDefault();
        return;
      }
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose, createMutation.isPending]);

  const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (createMutation.isPending) return;
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

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
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 m-auto h-fit w-full max-w-lg rounded-xl border border-gray-800/60 bg-gray-900 p-0 text-gray-100 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-100">Submit a Player Ticket</h2>
            <p className="mt-0.5 text-sm text-gray-500">AI will automatically categorize and suggest a response.</p>
          </div>
          {!createMutation.isPending && (
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-500 transition-colors hover:text-gray-300"
              aria-label="Close"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>

        {createMutation.isPending ? (
          <div className="flex flex-col items-center gap-4 py-10" aria-live="polite">
            <Spinner />
            <p className="text-sm text-gray-400">Analyzing ticket...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="modal-player-name" className="mb-1.5 block text-sm font-medium text-gray-300">Player Name</label>
                <input
                  ref={firstInputRef}
                  id="modal-player-name"
                  name="player_name"
                  autoComplete="off"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g. xVoidHunter"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="modal-subject" className="mb-1.5 block text-sm font-medium text-gray-300">Subject</label>
                <input
                  id="modal-subject"
                  name="subject"
                  autoComplete="off"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of the issue"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="modal-message" className="mb-1.5 block text-sm font-medium text-gray-300">Message</label>
                <textarea
                  id="modal-message"
                  name="message"
                  autoComplete="off"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      (e.target as HTMLTextAreaElement).form?.requestSubmit();
                    }
                  }}
                  rows={5}
                  placeholder="Describe the issue in detail..."
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-gray-500">&#8984;+Enter to submit</p>
              </div>

              {error ? <p role="alert" className="text-sm text-red-400">{error}</p> : null}

              <button
                type="submit"
                className="w-fit rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}

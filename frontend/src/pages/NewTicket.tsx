import { type FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createTicket } from '../api';
import Spinner from '../components/Spinner';

export default function NewTicket() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
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

    setSubmitting(true);
    try {
      const ticket = await createTicket({
        player_name: playerName.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      console.error('Failed to create ticket:', err);
      setError('Failed to create ticket.');
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none';

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
        &larr; Back to Dashboard
      </Link>

      <h1 className="text-xl font-semibold text-gray-100">Submit a Player Ticket</h1>

      {submitting ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <Spinner />
          <p className="text-sm text-gray-400">Analyzing ticket...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
          <div>
            <label htmlFor="player-name" className="mb-1.5 block text-sm font-medium text-gray-400">Player Name</label>
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
            <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-gray-400">Subject</label>
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
            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-gray-400">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Describe the issue in detail..."
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-fit rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Submit Ticket
          </button>
        </form>
      )}
    </div>
  );
}

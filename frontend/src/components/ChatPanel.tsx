import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { ChatMessage as ChatMessageType } from '../types';
import ChatMessage from './ChatMessage';
import Spinner from './Spinner';

interface Props {
  messages: ChatMessageType[];
  loading: boolean;
  ticketContext: string | null;
  onSend: (content: string) => void;
  onConfirmAction: (messageId: string, actionIndex: number) => void;
  onCancelAction: (messageId: string, actionIndex: number) => void;
  onClose: () => void;
}

export default function ChatPanel({
  messages,
  loading,
  ticketContext,
  onSend,
  onConfirmAction,
  onCancelAction,
  onClose,
}: Props) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onSend(trimmed);
  }

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  return (
    <div className="chat-slide-up fixed bottom-24 right-6 z-40 flex h-[calc(100vh-8rem)] max-h-[700px] w-[32rem] flex-col rounded-xl border border-gray-700 bg-gray-900/95 shadow-2xl backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-200">AI Assistant</span>
          {ticketContext && (
            <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-xs text-teal-400">
              Ticket context active
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="text-gray-500 hover:text-gray-300"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>

      {/* Disclaimer */}
      <div className="border-b border-gray-700/50 bg-gray-800/40 px-4 py-2">
        <p className="text-xs text-gray-500">Powered by Gemini Flash — responses may take a moment.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-400">How can I help you today?</p>
            <p className="mt-1 text-xs text-gray-600">
              Ask about tickets, search for issues, or request actions.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                onConfirmAction={(i) => onConfirmAction(msg.id, i)}
                onCancelAction={(i) => onCancelAction(msg.id, i)}
              />
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Spinner size="sm" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 px-4 py-3">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask something..."
            rows={1}
            style={{ maxHeight: '5.5rem' }}
            className="flex-1 resize-none overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 input-glow"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="rounded-lg bg-teal-600 px-3 py-2 text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95l15.5-6.5a.75.75 0 0 0 0-1.424l-15.5-6.5Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

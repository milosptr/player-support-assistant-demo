import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { sendChatMessage, markInProgress, resolveTicket, updateTicket } from '../api';
import { ticketKeys } from '../queryKeys';
import { showToast } from '../utils/toastManager';
import type { ChatMessage, ProposedAction, ActionStatus, Status, Category } from '../types';
import ChatPanel from './ChatPanel';

let nextId = 1;
function genId() {
  return `msg-${nextId++}`;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();

  const ticketMatch = location.pathname.match(/^\/tickets\/([^/]+)$/);
  const currentTicketId = ticketMatch ? ticketMatch[1] : null;

  async function handleSend(content: string) {
    const userMsg: ChatMessage = { id: genId(), role: 'user', content };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);

    try {
      const apiMessages = updated.map((m) => ({ role: m.role, content: m.content }));
      const response = await sendChatMessage({
        messages: apiMessages,
        current_ticket_id: currentTicketId ?? undefined,
        conversation_history: conversationHistory.length > 0 ? conversationHistory : undefined,
      });

      if (response.conversation_history) {
        setConversationHistory(response.conversation_history);
      }

      const assistantMsg: ChatMessage = {
        id: genId(),
        role: 'assistant',
        content: response.message,
        proposed_actions: response.proposed_actions.map((a) => ({
          ...a,
          status: 'pending' as ActionStatus,
        })),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: genId(),
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  function updateActionStatus(messageId: string, actionIndex: number, status: ActionStatus) {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.proposed_actions) return msg;
        const actions = msg.proposed_actions.map((a, i) =>
          i === actionIndex ? { ...a, status } : a,
        );
        return { ...msg, proposed_actions: actions };
      }),
    );
  }

  async function executeAction(action: ProposedAction): Promise<void> {
    const id = action.args.id;
    switch (action.type) {
      case 'update_ticket_status':
        if (action.args.status === 'in_progress') {
          await markInProgress(id);
        } else {
          await updateTicket(id, { status: action.args.status as Status });
        }
        break;
      case 'update_ticket_category':
        await updateTicket(id, { category: action.args.category as Category });
        break;
      case 'resolve_ticket':
        await resolveTicket(id, { agent_response: action.args.agent_response });
        break;
    }
  }

  async function handleConfirmAction(messageId: string, actionIndex: number) {
    const msg = messages.find((m) => m.id === messageId);
    const action = msg?.proposed_actions?.[actionIndex];
    if (!action || action.status !== 'pending') return;

    try {
      await executeAction(action);
      updateActionStatus(messageId, actionIndex, 'confirmed');
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
      showToast('Action completed', 'success');
    } catch {
      updateActionStatus(messageId, actionIndex, 'failed');
      showToast('Action failed', 'error');
    }
  }

  function handleCancelAction(messageId: string, actionIndex: number) {
    updateActionStatus(messageId, actionIndex, 'cancelled');
  }

  return (
    <>
      {open && (
        <ChatPanel
          messages={messages}
          loading={loading}
          ticketContext={currentTicketId}
          onSend={handleSend}
          onConfirmAction={handleConfirmAction}
          onCancelAction={handleCancelAction}
          onClose={() => setOpen(false)}
        />
      )}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 shadow-lg transition-colors hover:bg-teal-500"
      >
        {open ? (
          <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        ) : (
          <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </>
  );
}

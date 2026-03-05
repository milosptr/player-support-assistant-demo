export type Category = 'bug' | 'billing' | 'gameplay' | 'abuse' | 'feedback';
export type Status = 'open' | 'in_progress' | 'resolved';

export interface TicketSummary {
  id: string;
  player_name: string;
  subject: string;
  category: Category | '';
  status: Status;
  created_at: string;
}

export interface Ticket extends TicketSummary {
  message: string;
  ai_category: Category | '';
  ai_response: string;
  agent_response: string;
  resolved_at: string | null;
  updated_at: string;
}

export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  by_category: Record<Category, number>;
}

export interface CreateTicketData {
  player_name: string;
  subject: string;
  message: string;
}

export type ChatRole = 'user' | 'assistant';

export type ActionType =
  | 'update_ticket_status'
  | 'update_ticket_category'
  | 'resolve_ticket';

export type ActionStatus = 'pending' | 'confirmed' | 'cancelled' | 'failed';

export interface ProposedAction {
  type: ActionType;
  args: Record<string, string>;
  status?: ActionStatus;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  proposed_actions?: ProposedAction[];
}

export interface ChatRequest {
  messages: { role: ChatRole; content: string }[];
  current_ticket_id?: string;
  conversation_history?: unknown[];
}

export interface ChatResponse {
  message: string;
  proposed_actions: ProposedAction[];
  conversation_history?: unknown[];
}

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

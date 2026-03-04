import axios from 'axios';
import type { Ticket, TicketSummary, TicketStats, CreateTicketData, ChatRequest, ChatResponse } from './types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30_000,
});

export const getTickets = (params?: Record<string, string>) =>
  api.get<TicketSummary[]>('/tickets/', { params }).then((r) => r.data);

export const getTicket = (id: string) =>
  api.get<Ticket>(`/tickets/${id}/`).then((r) => r.data);

export const createTicket = (data: CreateTicketData) =>
  api.post<Ticket>('/tickets/', data).then((r) => r.data);

export const updateTicket = (id: string, data: Partial<Ticket>) =>
  api.patch<Ticket>(`/tickets/${id}/`, data).then((r) => r.data);

export const resolveTicket = (id: string, data: { agent_response: string }) =>
  api.post<Ticket>(`/tickets/${id}/resolve/`, data).then((r) => r.data);

export const markInProgress = (id: string) =>
  api.post<Ticket>(`/tickets/${id}/in-progress/`).then((r) => r.data);

export const regenerateAI = (id: string) =>
  api.post<Ticket>(`/tickets/${id}/regenerate/`).then((r) => r.data);

export const getStats = () =>
  api.get<TicketStats>('/tickets/stats/').then((r) => r.data);

export const sendChatMessage = (data: ChatRequest) =>
  api.post<ChatResponse>('/tickets/chat/', data, { timeout: 60_000 }).then((r) => r.data);

import type { ActionType, ProposedAction, ActionStatus, Status, Category } from '../types';
import { STATUS_CONFIG, CATEGORY_CONFIG } from '../utils/constants';

const actionLabels: Record<ActionType, (args: Record<string, string>) => string> = {
  update_ticket_status: (args) =>
    `Change ticket status to "${STATUS_CONFIG[args.status as Status]?.label ?? args.status}"`,
  update_ticket_category: (args) =>
    `Change ticket category to "${CATEGORY_CONFIG[args.category as Category]?.label ?? args.category}"`,
  resolve_ticket: (args) => {
    const text = args.agent_response ?? '';
    return `Resolve ticket with response: "${text.slice(0, 80)}${text.length > 80 ? '...' : ''}"`;
  },
};

function describeAction(action: ProposedAction): string {
  return actionLabels[action.type](action.args);
}

const settledStyles: Record<string, { label: string; border: string; bg: string; text: string }> = {
  confirmed: { label: 'Confirmed', border: 'border-teal-500/20', bg: 'bg-teal-500/5', text: 'text-teal-400' },
  cancelled: { label: 'Cancelled', border: 'border-gray-700', bg: 'bg-gray-800/50', text: 'text-gray-500' },
  failed: { label: 'Failed', border: 'border-red-500/20', bg: 'bg-red-500/5', text: 'text-red-400' },
};

interface Props {
  action: ProposedAction;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ActionConfirmation({ action, onConfirm, onCancel }: Props) {
  const settled = settledStyles[action.status as ActionStatus];
  if (settled) {
    return (
      <div className={`mt-2 rounded-lg border ${settled.border} ${settled.bg} px-3 py-2 text-sm ${settled.text}`}>
        {settled.label} — {describeAction(action)}
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-teal-500/30 bg-gray-800/80 px-3 py-2.5">
      <p className="text-sm text-gray-300">{describeAction(action)}</p>
      <div className="mt-2 flex gap-2">
        <button
          onClick={onConfirm}
          className="rounded-md bg-teal-600 px-3 py-1 text-xs font-medium text-white hover:bg-teal-500"
        >
          Confirm
        </button>
        <button
          onClick={onCancel}
          className="rounded-md bg-gray-700 px-3 py-1 text-xs font-medium text-gray-300 hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

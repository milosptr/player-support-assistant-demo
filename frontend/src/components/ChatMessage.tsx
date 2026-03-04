import type { ChatMessage as ChatMessageType, ProposedAction } from '../types';
import ActionConfirmation from './ActionConfirmation';

interface Props {
  message: ChatMessageType;
  onConfirmAction: (actionIndex: number) => void;
  onCancelAction: (actionIndex: number) => void;
}

export default function ChatMessage({ message, onConfirmAction, onCancelAction }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isUser ? 'order-1' : ''}`}>
        <div
          className={`rounded-lg px-3 py-2 text-sm leading-relaxed ${
            isUser
              ? 'bg-teal-600/20 text-teal-100'
              : 'bg-gray-800 text-gray-200'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        {message.proposed_actions?.map((action: ProposedAction, i: number) => (
          <ActionConfirmation
            key={i}
            action={action}
            onConfirm={() => onConfirmAction(i)}
            onCancel={() => onCancelAction(i)}
          />
        ))}
      </div>
    </div>
  );
}

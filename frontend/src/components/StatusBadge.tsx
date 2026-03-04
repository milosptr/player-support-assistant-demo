import type { Status } from '../types';
import { STATUS_CONFIG } from '../utils/constants';

export default function StatusBadge({ status }: { status: Status }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text} ${config.ring}`}>
      {config.label}
    </span>
  );
}

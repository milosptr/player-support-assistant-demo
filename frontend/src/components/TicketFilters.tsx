import type { Category, Status } from "../types";
import {
  CATEGORIES,
  STATUSES,
  CATEGORY_CONFIG,
  STATUS_CONFIG,
} from "../utils/constants";

interface Props {
  status: Status | "";
  category: Category | "";
  onStatusChange: (status: Status | "") => void;
  onCategoryChange: (category: Category | "") => void;
}

function Toggle({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/30"
          : "bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 hover:text-gray-300"
      }`}
    >
      {label}
    </button>
  );
}

export default function TicketFilters({
  status,
  category,
  onStatusChange,
  onCategoryChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <span className="w-20 text-xs font-medium uppercase tracking-wider text-gray-500">
          Status
        </span>
        <Toggle
          active={status === ""}
          label="All"
          onClick={() => onStatusChange("")}
        />
        {STATUSES.map((s) => (
          <Toggle
            key={s}
            active={status === s}
            label={STATUS_CONFIG[s].label}
            onClick={() => onStatusChange(s)}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="w-20 text-xs font-medium uppercase tracking-wider text-gray-500">
          Category
        </span>
        <Toggle
          active={category === ""}
          label="All"
          onClick={() => onCategoryChange("")}
        />
        {CATEGORIES.map((c) => (
          <Toggle
            key={c}
            active={category === c}
            label={CATEGORY_CONFIG[c].label}
            onClick={() => onCategoryChange(c)}
          />
        ))}
      </div>
    </div>
  );
}

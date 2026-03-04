import type { Category } from '../types';
import { CATEGORY_CONFIG } from '../utils/constants';

export default function CategoryBadge({ category }: { category: Category | '' }) {
  if (!category) return null;
  const config = CATEGORY_CONFIG[category];
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

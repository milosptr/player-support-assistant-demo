export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'h-5 w-5' : 'h-8 w-8';
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${dim} animate-spin rounded-full border-2 border-gray-600 border-t-teal-400`}
    />
  );
}

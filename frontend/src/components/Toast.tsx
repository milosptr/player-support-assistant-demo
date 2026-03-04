import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot, removeToast } from '../utils/toastManager';

const icons = {
  success: (
    <svg aria-hidden="true" className="h-4 w-4 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg aria-hidden="true" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
    </svg>
  ),
};

const borderColors = {
  success: 'border-teal-500/30',
  error: 'border-red-500/30',
};

export default function ToastContainer() {
  const toasts = useSyncExternalStore(subscribe, getSnapshot);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-24 z-50 flex flex-col gap-2" aria-live="polite" role="status">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2.5 rounded-lg border bg-gray-900/95 px-4 py-3 shadow-lg backdrop-blur ${borderColors[toast.variant]} ${toast.removing ? 'toast-out' : 'toast-in'}`}
        >
          {icons[toast.variant]}
          <span className="text-sm text-gray-200">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
            className="ml-2 text-gray-500 hover:text-gray-300"
          >
            <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

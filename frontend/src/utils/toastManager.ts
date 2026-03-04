export type Variant = 'success' | 'error';

export interface Toast {
  id: number;
  message: string;
  variant: Variant;
  removing?: boolean;
}

let toasts: Toast[] = [];
let nextId = 0;
let listeners: Array<() => void> = [];

function emit() {
  listeners.forEach((l) => l());
}

export function showToast(message: string, variant: Variant = 'success') {
  const id = nextId++;
  toasts = [...toasts, { id, message, variant }];
  emit();
  setTimeout(() => removeToast(id), 3000);
}

export function removeToast(id: number) {
  toasts = toasts.map((t) => (t.id === id ? { ...t, removing: true } : t));
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 200);
}

export function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getSnapshot(): Toast[] {
  return toasts;
}

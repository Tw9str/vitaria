"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Variant = "success" | "error";

type ToastItem = {
  id: string;
  message: string;
  variant: Variant;
  /** true once the dismiss timeout starts — triggers slide-out animation */
  leaving: boolean;
};

type AddToast = (message: string, variant: Variant) => void;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const ToastContext = createContext<AddToast>(() => {});

export function useToast() {
  const add = useContext(ToastContext);
  return {
    success: (msg: string) => add(msg, "success"),
    error: (msg: string) => add(msg, "error"),
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
const DURATION = 4000; // ms before auto-dismiss
const EXIT_DURATION = 300; // ms for slide-out animation

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: string) => {
    // First mark as leaving to trigger animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    );
    // Then remove from DOM after animation
    const t = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(id);
    }, EXIT_DURATION);
    timers.current.set(id, t);
  }, []);

  const add = useCallback<AddToast>(
    (message, variant) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant, leaving: false }]);
      const t = setTimeout(() => remove(id), DURATION);
      timers.current.set(id, t);
    },
    [remove],
  );

  // Cleanup timers on unmount
  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={add}>
      {children}
      <ToastStack toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Toast stack (portaled to document.body)
// ---------------------------------------------------------------------------
function ToastStack({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || toasts.length === 0) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-5 right-5 z-9999 flex flex-col gap-2 items-end pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------
// Single toast card
// ---------------------------------------------------------------------------
const ICONS: Record<Variant, React.ReactNode> = {
  success: (
    <svg
      className="h-4 w-4 shrink-0 text-green-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  ),
  error: (
    <svg
      className="h-4 w-4 shrink-0 text-red-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
      />
    </svg>
  ),
};

function ToastCard({
  toast,
  onRemove,
}: {
  toast: ToastItem;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border border-border bg-surface shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl px-4 py-3 max-w-sm text-sm transition-all duration-300 ${
        toast.leaving ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
      }`}
    >
      <span className="mt-0.5">{ICONS[toast.variant]}</span>
      <p className="flex-1 text-text">{toast.message}</p>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="shrink-0 mt-0.5 text-muted hover:text-text transition cursor-pointer"
        aria-label="Dismiss"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

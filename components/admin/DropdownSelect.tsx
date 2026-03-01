"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type DropdownOption = {
  value: string;
  label: string;
  /** Tailwind bg-* class for the dot, e.g. "bg-gold". Pass null to hide the dot. */
  dotClass: string | null;
};

type Props = {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  isPending?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  heading?: string;
};

export default function DropdownSelect({
  value,
  options,
  onChange,
  isPending = false,
  ariaLabel,
  disabled = false,
  heading,
}: Props) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);

  const current = options.find((o) => o.value === value) ?? options[0];

  // Position the portal panel below the trigger on open.
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPanelStyle({
      position: "fixed",
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
  }, [open]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        panelRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function select(next: string) {
    setOpen(false);
    onChange(next);
  }

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex cursor-pointer items-center gap-2 rounded-2xl border border-border bg-bg/90 px-3 py-1.5 text-sm text-muted outline-none transition hover:border-gold/40 focus-visible:ring-4 focus-visible:ring-gold/15 disabled:opacity-50"
      >
        {current?.dotClass && (
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${current.dotClass} ${isPending ? "animate-pulse" : ""}`}
          />
        )}
        <span>{current?.label}</span>
        <svg
          className={`h-3.5 w-3.5 text-subtle transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown panel — portalled to body to escape overflow:hidden ancestors */}
      {open &&
        createPortal(
          <ul
            ref={panelRef}
            role="listbox"
            aria-label={ariaLabel}
            style={panelStyle}
            className="z-9999 min-w-35 overflow-hidden rounded-2xl border border-border bg-bg/90 shadow-soft"
          >
            {heading && (
              <li
                role="presentation"
                className="px-4 pb-1 pt-2.5 text-xs font-medium text-subtle"
              >
                {heading}
              </li>
            )}
            {options.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
              >
                <button
                  type="button"
                  onClick={() => select(opt.value)}
                  className={`flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-sm transition hover:bg-surface ${
                    opt.value === value ? "text-text" : "text-muted"
                  }`}
                >
                  {opt.dotClass && (
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${opt.dotClass}`}
                    />
                  )}
                  {opt.label}
                  {opt.value === value && (
                    <svg
                      className="ml-auto h-3.5 w-3.5 text-subtle"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  );
}

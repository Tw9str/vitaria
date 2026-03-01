"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import {
  createNoteAction,
  updateNoteAction,
  deleteNoteAction,
  toggleNotePinAction,
} from "@/app/actions/note";
import type { NoteItem } from "@/lib/db/notes";
import Spinner from "@/components/shared/Spinner";

// ─── Modal ──────────────────────────────────────────────────────────────────

type ModalMode = { type: "new" } | { type: "edit"; note: NoteItem };

function NoteModal({
  mode,
  onClose,
}: {
  mode: ModalMode;
  onClose: () => void;
}) {
  const isEdit = mode.type === "edit";
  const [content, setContent] = useState(isEdit ? mode.note.content : "");
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSave() {
    if (!content.trim()) return;
    startTransition(async () => {
      if (isEdit) {
        await updateNoteAction(mode.note.id, content);
      } else {
        await createNoteAction(content);
      }
      onClose();
    });
  }

  function handleDelete() {
    if (!isEdit) return;
    startTransition(async () => {
      await deleteNoteAction(mode.note.id);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-text">
            {isEdit ? "Edit note" : "New note"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border text-subtle transition hover:bg-black/10"
            aria-label="Close"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5"
              aria-hidden
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note…"
          rows={5}
          className="mt-3 w-full resize-none rounded-xl border border-border bg-black/5 px-3 py-2.5 text-sm text-text placeholder:text-subtle focus:border-brand-ink/40 focus:outline-none focus:ring-2 focus:ring-brand-ink/10"
        />

        <div className="mt-3 flex items-center justify-between gap-2">
          {isEdit ? (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="cursor-pointer text-xs text-red-500 transition hover:underline disabled:opacity-50"
            >
              Delete
            </button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="cursor-pointer rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted transition hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || !content.trim()}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-brand-ink px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {isPending && <Spinner className="h-3 w-3" />}
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Widget ─────────────────────────────────────────────────────────────────

type Props = { notes: NoteItem[] };

export default function NotesWidget({ notes }: Props) {
  const [modal, setModal] = useState<ModalMode | null>(null);
  const [pendingPinId, setPendingPinId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [bouncingId, setBouncingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function togglePin(note: NoteItem) {
    setBouncingId(note.id);
    setTimeout(() => setBouncingId(null), 200);
    setPendingPinId(note.id);
    startTransition(async () => {
      await toggleNotePinAction(note.id, !note.pinned);
      setPendingPinId(null);
    });
  }

  function handleDelete(e: React.MouseEvent, note: NoteItem) {
    e.stopPropagation();
    setPendingDeleteId(note.id);
    startTransition(async () => {
      await deleteNoteAction(note.id);
      setPendingDeleteId(null);
    });
  }

  return (
    <>
      <div className="rounded-[18px] border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <h2 className="text-sm font-semibold">Notes</h2>
          <button
            onClick={() => setModal({ type: "new" })}
            className="flex cursor-pointer items-center gap-1 rounded-full border border-border bg-black/5 px-3 py-1 text-xs font-medium text-muted transition hover:bg-black/10"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3 w-3"
              aria-hidden
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New
          </button>
        </div>

        {notes.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-subtle">
            No notes yet.
          </p>
        ) : (
          <div className="max-h-104 overflow-y-auto divide-y divide-border">
            {notes.map((note) => (
              <div
                key={note.id}
                className="group flex items-start gap-2 px-4 py-3"
              >
                {/* Pin button */}
                <button
                  onClick={() => togglePin(note)}
                  disabled={pendingPinId === note.id}
                  title={note.pinned ? "Unpin" : "Pin"}
                  className={`mt-0.5 shrink-0 cursor-pointer transition-all duration-200 ${
                    note.pinned
                      ? "text-gold"
                      : "text-subtle opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill={note.pinned ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`h-3.5 w-3.5 origin-center transition-transform duration-200 ${
                      bouncingId === note.id ? "scale-150" : "scale-100"
                    } ${pendingPinId === note.id ? "animate-spin" : ""}`}
                    aria-hidden
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>

                {/* Content — click to edit */}
                <button
                  className="min-w-0 flex-1 cursor-pointer text-left"
                  onClick={() => setModal({ type: "edit", note })}
                >
                  <p className="line-clamp-2 text-sm text-text">
                    {note.content}
                  </p>
                  <p className="mt-0.5 text-xs text-subtle">
                    {new Date(note.updatedAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </button>

                {/* Delete shortcut */}
                <button
                  onClick={(e) => handleDelete(e, note)}
                  disabled={pendingDeleteId === note.id}
                  title="Delete note"
                  className="mt-0.5 shrink-0 cursor-pointer text-subtle opacity-0 transition-all duration-200 hover:text-red-500 group-hover:opacity-100 disabled:opacity-50"
                >
                  {pendingDeleteId === note.id ? (
                    <Spinner className="h-3.5 w-3.5" />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5"
                      aria-hidden
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && <NoteModal mode={modal} onClose={() => setModal(null)} />}
    </>
  );
}

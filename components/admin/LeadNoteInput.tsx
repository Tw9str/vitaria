"use client";

import { useRef, useState } from "react";
import { updateLeadNotesAction } from "@/app/actions/lead";

type Props = {
  leadId: string;
  initialNotes: string | null;
};

export default function LeadNoteInput({ leadId, initialNotes }: Props) {
  const [value, setValue] = useState(initialNotes ?? "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleBlur() {
    const trimmed = value.trim();
    const original = (initialNotes ?? "").trim();
    if (trimmed === original) return;

    setSaving(true);
    try {
      await updateLeadNotesAction(leadId, trimmed);
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          placeholder="Add internal note…"
          rows={2}
          className="w-full resize-none rounded-xl border border-border bg-black/5 px-3 py-2 text-sm text-text placeholder:text-subtle focus:border-brand-ink/40 focus:outline-none focus:ring-2 focus:ring-brand-ink/10"
        />
      </div>
      {(saving || saved) && (
        <p className="mt-1 text-xs text-subtle">
          {saving ? "Saving…" : "Saved"}
        </p>
      )}
    </div>
  );
}

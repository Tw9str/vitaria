// Shared primitive form-field components for the product editor.
// These are intentionally plain — no "use client" needed since they contain
// no hooks and are used inside a client component tree.

import { type ReactNode } from "react";

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const pct = len / max;
  const color =
    pct >= 1 ? "text-red-500" : pct >= 0.85 ? "text-amber-500" : "text-subtle";
  if (pct < 0.6) return null; // only show when getting close
  return (
    <span className={`text-[11px] tabular-nums ${color}`}>
      {len}/{max}
    </span>
  );
}

export function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  maxLength,
  rows,
  hint,
  errors,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  hint?: ReactNode;
  errors?: string[];
}) {
  const baseClass = `w-full rounded-2xl border bg-black/10 px-4 py-3 outline-none focus:ring-4 focus:ring-gold/15 ${
    errors?.length ? "border-red-500" : "border-default"
  }`;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-subtle">{label}</span>
        <span className="flex items-center gap-2">
          {hint}
          {maxLength && <CharCount value={value} max={maxLength} />}
        </span>
      </div>
      {rows ? (
        <textarea
          className={`${baseClass} resize-none`}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
        />
      ) : (
        <input
          className={baseClass}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
        />
      )}
      <FieldErrors errors={errors} />
    </div>
  );
}

export function Multi({
  label,
  name,
  value,
  onChange,
  hint,
  errors,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  errors?: string[];
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs text-subtle">{label}</span>
        {hint && <span className="text-[11px] text-subtle">{hint}</span>}
      </div>
      <textarea
        className={`w-full min-h-30 rounded-2xl border bg-black/10 px-4 py-3 outline-none focus:ring-4 focus:ring-gold/15 ${
          errors?.length ? "border-red-500" : "border-default"
        }`}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <FieldErrors errors={errors} />
    </div>
  );
}

export function Progress({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-55">
      <div className="text-xs text-subtle mb-1">{label}</div>
      <div className="h-1 w-full rounded bg-black/20">
        <div className="h-1 rounded bg-black" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function FieldErrors({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <ul className="mt-1 space-y-0.5 pl-0 list-none">
      {errors.map((e) => (
        <li key={e} className="text-xs text-red-500">
          {e}
        </li>
      ))}
    </ul>
  );
}

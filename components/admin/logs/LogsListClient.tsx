"use client";

import { useState, useTransition } from "react";
import type { LogEntry } from "@/lib/db/logs";

// ─── Constants ───────────────────────────────────────────────────────────────

const ENTITIES = ["all", "product", "lead", "user", "note", "profile"] as const;
const SEVERITIES = ["all", "info", "warning", "error"] as const;

const ACTION_LABELS: Record<string, string> = {
  PRODUCT_CREATED: "Created product",
  PRODUCT_UPDATED: "Updated product",
  PRODUCT_DELETED: "Deleted product",
  PRODUCT_PUBLISHED: "Published product",
  PRODUCT_UNPUBLISHED: "Unpublished product",
  LEAD_STATUS_CHANGED: "Changed lead status",
  LEAD_NOTES_SAVED: "Saved lead notes",
  USER_CREATED: "Created user",
  USER_DELETED: "Deleted user",
  USER_RENAMED: "Renamed user",
  USER_ROLE_CHANGED: "Changed user role",
  NOTE_CREATED: "Created note",
  NOTE_UPDATED: "Updated note",
  NOTE_DELETED: "Deleted note",
  NOTE_PINNED: "Pinned note",
  NOTE_UNPINNED: "Unpinned note",
  PROFILE_UPDATED: "Updated profile",
};

const SEVERITY_DOT: Record<string, string> = {
  info: "bg-brand-ink/40",
  warning: "bg-amber-400",
  error: "bg-red-500",
};

const SEVERITY_BADGE: Record<string, string> = {
  info: "bg-black/5 text-muted",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-600",
};

function formatDate(d: Date) {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

type Props = {
  initialLogs: LogEntry[];
  initialHasMore: boolean;
  onLoadMore: (
    entity: string,
    severity: string,
    skip: number,
  ) => Promise<{ logs: LogEntry[]; hasMore: boolean }>;
};

export default function LogsListClient({
  initialLogs,
  initialHasMore,
  onLoadMore,
}: Props) {
  const [entity, setEntity] = useState<string>("all");
  const [severity, setSeverity] = useState<string>("all");
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [skip, setSkip] = useState(initialLogs.length);
  const [isPending, startTransition] = useTransition();

  function handleEntityChange(val: string) {
    setEntity(val);
    startTransition(async () => {
      const result = await onLoadMore(val, severity, 0);
      setLogs(result.logs);
      setHasMore(result.hasMore);
      setSkip(result.logs.length);
    });
  }

  function handleSeverityChange(val: string) {
    setSeverity(val);
    startTransition(async () => {
      const result = await onLoadMore(entity, val, 0);
      setLogs(result.logs);
      setHasMore(result.hasMore);
      setSkip(result.logs.length);
    });
  }

  function handleLoadMore() {
    startTransition(async () => {
      const result = await onLoadMore(entity, severity, skip);
      setLogs((prev) => [...prev, ...result.logs]);
      setHasMore(result.hasMore);
      setSkip((prev) => prev + result.logs.length);
    });
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Entity filter */}
        <div className="flex flex-wrap gap-1.5">
          {ENTITIES.map((e) => (
            <button
              key={e}
              onClick={() => handleEntityChange(e)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                entity === e
                  ? "bg-brand-ink text-white"
                  : "bg-black/5 text-muted hover:bg-black/10 hover:text-text"
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              onClick={() => handleSeverityChange(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                severity === s
                  ? "bg-brand-ink text-white"
                  : "bg-black/5 text-muted hover:bg-black/10 hover:text-text"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[18px] border border-border overflow-hidden">
        {logs.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            No activity found.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted w-24">
                      Severity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted">
                      Entity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted">
                      Actor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted">
                      Detail
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted whitespace-nowrap">
                      When
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {logs.map((log) => (
                    <tr key={log.id} className={isPending ? "opacity-60" : ""}>
                      {/* Severity */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${SEVERITY_BADGE[log.severity] ?? SEVERITY_BADGE.info}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${SEVERITY_DOT[log.severity] ?? SEVERITY_DOT.info}`}
                          />
                          {log.severity}
                        </span>
                      </td>
                      {/* Action */}
                      <td className="px-4 py-3 font-medium text-text">
                        {ACTION_LABELS[log.action] ?? log.action}
                      </td>
                      {/* Entity title + type */}
                      <td className="px-4 py-3">
                        <span className="capitalize text-muted text-xs">
                          {log.entity}
                        </span>
                        {log.entityTitle && (
                          <p className="truncate max-w-40 text-text text-xs mt-0.5">
                            {log.entityTitle}
                          </p>
                        )}
                      </td>
                      {/* Actor */}
                      <td className="px-4 py-3 text-xs text-muted">
                        {log.actorName ? (
                          <>
                            <span className="text-text font-medium">
                              {log.actorName}
                            </span>
                            <br />
                            <span>{log.actorEmail}</span>
                          </>
                        ) : (
                          log.actorEmail
                        )}
                      </td>
                      {/* Detail */}
                      <td className="px-4 py-3 text-xs text-muted max-w-50 truncate">
                        {log.detail ?? "—"}
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div className="border-t border-border px-4 py-3 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isPending}
                  className="rounded-xl px-4 py-2 text-xs font-medium bg-black/5 text-muted hover:bg-brand-ink hover:text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

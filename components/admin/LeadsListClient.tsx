"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import LeadStatusSelect from "./LeadStatusSelect";
import LeadNoteInput from "./LeadNoteInput";
import { fetchLeadsAction, type LeadRow } from "@/app/actions/lead";
import { LEAD_STATUSES } from "@/lib/leads";
import Spinner from "@/components/shared/Spinner";
import DropdownSelect, { type DropdownOption } from "./DropdownSelect";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  read: "Read",
  contacted: "Contacted",
  closed: "Closed",
};

const DEBOUNCE_MS = 350;
const PAGE_SIZE_OPTIONS: DropdownOption[] = [
  { value: "10", label: "10", dotClass: null },
  { value: "25", label: "25", dotClass: null },
  { value: "50", label: "50", dotClass: null },
  { value: "100", label: "100", dotClass: null },
];

type Props = {
  initialLeads: LeadRow[];
  initialHasMore: boolean;
};

export default function LeadsListClient({
  initialLeads,
  initialHasMore,
}: Props) {
  const [leads, setLeads] = useState<LeadRow[]>(initialLeads);
  const [hasMore, setHasMore] = useState(initialHasMore);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [pageSize, setPageSize] = useState("50");

  const [isFetching, startFetch] = useTransition();
  const [isLoadingMore, startLoadMore] = useTransition();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track latest filter values so async callbacks read fresh data
  const activeSearch = useRef(search);
  const activeStatus = useRef(statusFilter);
  const activePageSize = useRef(pageSize);

  function triggerFetch(s: string, status: string, ps: string) {
    activeSearch.current = s;
    activeStatus.current = status;
    activePageSize.current = ps;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startFetch(async () => {
        const { leads: rows, hasMore: more } = await fetchLeadsAction({
          search: s,
          status,
          skip: 0,
          pageSize: Number(ps),
        });
        setLeads(rows);
        setHasMore(more);
      });
    }, DEBOUNCE_MS);
  }

  function handleSearchChange(val: string) {
    setSearch(val);
    triggerFetch(val, activeStatus.current, activePageSize.current);
  }

  function handleStatusChange(val: string) {
    setStatusFilter(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    activeStatus.current = val;
    startFetch(async () => {
      const { leads: rows, hasMore: more } = await fetchLeadsAction({
        search: activeSearch.current,
        status: val,
        skip: 0,
        pageSize: Number(activePageSize.current),
      });
      setLeads(rows);
      setHasMore(more);
    });
  }

  function handlePageSizeChange(ps: string) {
    setPageSize(ps);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    activePageSize.current = ps;
    startFetch(async () => {
      const { leads: rows, hasMore: more } = await fetchLeadsAction({
        search: activeSearch.current,
        status: activeStatus.current,
        skip: 0,
        pageSize: Number(ps),
      });
      setLeads(rows);
      setHasMore(more);
    });
  }

  function loadMore() {
    startLoadMore(async () => {
      const { leads: more, hasMore: next } = await fetchLeadsAction({
        search: activeSearch.current,
        status: activeStatus.current,
        skip: leads.length,
        pageSize: Number(activePageSize.current),
      });
      setLeads((prev) => [...prev, ...more]);
      setHasMore(next);
    });
  }

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const isFiltering = search || statusFilter !== "all";

  return (
    <div>
      {/* Filter bar */}
      <div className="mt-5 flex flex-col gap-2.5">
        {/* Row 1: Search + Per-page */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search name, company, email…"
              className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-8 text-sm text-text placeholder:text-subtle focus:border-brand-ink/40 focus:outline-none focus:ring-2 focus:ring-brand-ink/10"
            />
            {isFetching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle">
                <Spinner className="h-3.5 w-3.5" />
              </span>
            )}
            {!isFetching && search && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-subtle hover:text-text"
                aria-label="Clear search"
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
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-subtle">Per page</span>
            <DropdownSelect
              value={pageSize}
              options={PAGE_SIZE_OPTIONS}
              onChange={handlePageSizeChange}
              isPending={isFetching}
              ariaLabel="Leads per page"
            />
          </div>
        </div>

        {/* Row 2: Status pills + count */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => handleStatusChange("all")}
            className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition ${
              statusFilter === "all"
                ? "border-brand-ink bg-brand-ink text-white"
                : "border-border bg-surface text-muted hover:bg-black/10"
            }`}
          >
            All
          </button>
          {LEAD_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s === statusFilter ? "all" : s)}
              className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition ${
                statusFilter === s
                  ? "border-brand-ink bg-brand-ink text-white"
                  : "border-border bg-surface text-muted hover:bg-black/10"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}

          <span className="ml-1 text-xs text-subtle">
            {isFiltering && !isFetching
              ? `${leads.length}${hasMore ? "+" : ""} lead${leads.length !== 1 ? "s" : ""} found`
              : null}
          </span>
        </div>
      </div>

      {/* List */}
      {isFetching ? (
        <div className="mt-10 flex justify-center">
          <Spinner className="h-5 w-5 text-subtle" />
        </div>
      ) : leads.length === 0 ? (
        <div className="mt-8 text-center text-sm text-subtle">
          No leads match your filters.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
          {leads.map((l) => (
            <div
              key={l.id}
              className="rounded-[18px] border border-border bg-surface p-5"
            >
              {/* Top row */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text">{l.company}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {l.name}&nbsp;&bull;&nbsp;
                    <a href={`mailto:${l.email}`} className="hover:underline">
                      {l.email}
                    </a>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <LeadStatusSelect leadId={l.id} currentStatus={l.status} />
                  <time className="text-xs text-subtle">
                    {new Date(l.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    &middot;{" "}
                    {new Date(l.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>

              {/* Details row */}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                <span>
                  <span className="text-subtle">Type</span>&nbsp;{l.type}
                </span>
                {l.region && (
                  <span>
                    <span className="text-subtle">Region</span>&nbsp;{l.region}
                  </span>
                )}
                {l.website && (
                  <span>
                    <span className="text-subtle">Website</span>&nbsp;
                    <a
                      href={l.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {l.website}
                    </a>
                  </span>
                )}
              </div>

              {/* Message */}
              {l.message && (
                <p className="mt-3 max-w-[72ch] text-sm text-muted">
                  {l.message}
                </p>
              )}

              {/* Internal note */}
              <LeadNoteInput leadId={l.id} initialNotes={l.notes ?? null} />
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !isFetching && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium text-muted transition hover:bg-black/10 disabled:opacity-50"
          >
            {isLoadingMore && <Spinner className="h-3.5 w-3.5" />}
            {isLoadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import DropdownSelect, {
  type DropdownOption,
} from "@/components/admin/DropdownSelect";

type Props = {
  highlights: string[];
  activeHighlight?: string;
  activeSort?: string;
  total: number;
  filtered: number;
};

const SORT_OPTIONS: DropdownOption[] = [
  { value: "newest", label: "Newest", dotClass: null },
  { value: "a-z", label: "Name A → Z", dotClass: null },
  { value: "z-a", label: "Name Z → A", dotClass: null },
];

export default function ProductFilterBar({
  highlights,
  activeHighlight,
  activeSort,
  total,
  filtered,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/products${params.size ? `?${params.toString()}` : ""}`, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

  const currentSort = activeSort ?? "newest";

  return (
    <div className="mb-8 space-y-4">
      {/* Filter chips + sort row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => update("highlight", null)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              !activeHighlight
                ? "border-brand-ink bg-brand-ink text-white"
                : "border-border bg-surface text-muted hover:text-text cursor-pointer"
            }`}
          >
            All
          </button>
          {highlights.map((h) => (
            <button
              key={h}
              onClick={() =>
                update("highlight", h === activeHighlight ? null : h)
              }
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                activeHighlight === h
                  ? "border-brand-ink bg-brand-ink text-white"
                  : "border-border bg-surface text-muted hover:text-text cursor-pointer"
              }`}
            >
              {h}
            </button>
          ))}
        </div>

        {/* Sort */}
        <DropdownSelect
          value={currentSort}
          options={SORT_OPTIONS}
          ariaLabel="Sort products"
          onChange={(val) => update("sort", val === "newest" ? null : val)}
        />
      </div>

      {/* Results count */}
      <p className="text-sm text-subtle">
        {activeHighlight || activeSort ? (
          <>
            Showing <span className="font-medium text-text">{filtered}</span> of{" "}
            <span className="font-medium text-text">{total}</span> products
          </>
        ) : (
          <>
            <span className="font-medium text-text">{total}</span>{" "}
            {total === 1 ? "product" : "products"}
          </>
        )}
      </p>
    </div>
  );
}

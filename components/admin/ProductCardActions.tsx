"use client";

import { useOptimistic, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import {
  toggleProductPublishedAction,
  quickDeleteProductAction,
} from "@/app/actions/product";
import { useToast } from "@/components/shared/Toaster";
import Spinner from "@/components/shared/Spinner";

export default function ProductCardActions({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [optimisticPublished, setOptimisticPublished] =
    useOptimistic(published);

  function handleToggle() {
    const next = !optimisticPublished;
    startTransition(async () => {
      setOptimisticPublished(next);
      try {
        await toggleProductPublishedAction(id, next);
        router.refresh();
      } catch {
        setOptimisticPublished(!next); // roll back
        toast.error("Failed to update publish status.");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await quickDeleteProductAction(id);
        router.refresh();
      } catch {
        setConfirmDelete(false);
        toast.error("Failed to delete product.");
      }
    });
  }

  if (confirmDelete) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="rounded-full px-3 py-1.5 text-xs font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5"
        >
          {isPending && <Spinner className="h-3 w-3" />}
          {isPending ? "Deleting…" : "Confirm"}
        </button>
        <button
          onClick={() => setConfirmDelete(false)}
          disabled={isPending}
          className="rounded-full p-2 border border-border bg-surface text-muted hover:text-text hover:border-text/25 disabled:opacity-50 transition cursor-pointer"
          aria-label="Cancel delete"
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

  return (
    <div className="flex items-center gap-1.5">
      {/* Publish toggle */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        aria-label={optimisticPublished ? "Unpublish" : "Publish"}
        className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold border transition cursor-pointer disabled:opacity-50 ${
          optimisticPublished
            ? "bg-green-500/10 border-green-500/25 text-green-600 dark:text-green-400 hover:bg-green-500/20"
            : "bg-amber-400/10 border-amber-400/25 text-amber-600 dark:text-amber-400 hover:bg-amber-400/20"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${optimisticPublished ? "bg-green-500" : "bg-amber-400"} ${isPending ? "animate-pulse" : ""}`}
        />
        {optimisticPublished ? "Published" : "Draft"}
      </button>

      {/* Delete */}
      <button
        onClick={() => setConfirmDelete(true)}
        disabled={isPending}
        className="flex items-center justify-center rounded-full p-2 border border-border bg-surface text-muted hover:text-red-500 hover:border-red-500/30 disabled:opacity-50 transition cursor-pointer"
        aria-label="Delete product"
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}

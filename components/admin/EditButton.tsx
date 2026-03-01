"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type React from "react";
import Spinner from "@/components/shared/Spinner";

export default function EditButton({
  href,
  label = "Edit",
  icon,
  className = "shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold transition hover:brightness-110 disabled:opacity-60 cursor-pointer disabled:cursor-default",
}: {
  href: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (pending) return;
        setPending(true);
        router.push(href);
      }}
      className={className}
    >
      {pending ? <Spinner className="h-3 w-3 text-muted" /> : icon}
      {label}
    </button>
  );
}

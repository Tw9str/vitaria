"use client";

import { useState, useTransition } from "react";
import { updateLeadStatusAction } from "@/app/actions/lead";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads";
import DropdownSelect, { type DropdownOption } from "./DropdownSelect";

const OPTIONS: DropdownOption[] = [
  { value: "new", label: "New", dotClass: "bg-gold" },
  { value: "read", label: "Read", dotClass: "bg-subtle" },
  { value: "contacted", label: "Contacted", dotClass: "bg-green-500" },
  { value: "closed", label: "Closed", dotClass: "bg-red-500" },
];

type Props = {
  leadId: string;
  currentStatus: string;
};

export default function LeadStatusSelect({ leadId, currentStatus }: Props) {
  const [status, setStatus] = useState<LeadStatus>(
    (LEAD_STATUSES as readonly string[]).includes(currentStatus)
      ? (currentStatus as LeadStatus)
      : "new",
  );
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string) {
    const prev = status;
    setStatus(next as LeadStatus);
    startTransition(async () => {
      try {
        await updateLeadStatusAction(leadId, next as LeadStatus);
      } catch {
        setStatus(prev);
      }
    });
  }

  return (
    <DropdownSelect
      value={status}
      options={OPTIONS}
      onChange={handleChange}
      isPending={isPending}
      ariaLabel="Lead status"
    />
  );
}

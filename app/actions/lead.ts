"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prismaClient";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads";
import { appendLog } from "@/lib/logger";

const PAGE_SIZE = 50;

export async function updateLeadStatusAction(
  leadId: string,
  status: LeadStatus,
): Promise<void> {
  const session = await auth();
  requireAuth(session?.role);
  const actor = {
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name,
  };

  if (!LEAD_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { name: true, company: true },
  });
  if (!lead) throw new Error(`Lead not found: ${leadId}`);

  await prisma.lead.update({
    where: { id: leadId },
    data: { status },
  });
  await appendLog({
    ...actor,
    action: "LEAD_STATUS_CHANGED",
    entity: "lead",
    entityId: leadId,
    entityTitle: lead ? `${lead.name} — ${lead.company}` : leadId,
    detail: `Status → ${status}`,
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function updateLeadNotesAction(
  leadId: string,
  notes: string,
): Promise<void> {
  const session = await auth();
  requireAuth(session?.role);
  const actor = {
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name,
  };

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { name: true, company: true },
  });
  if (!lead) throw new Error(`Lead not found: ${leadId}`);

  await prisma.lead.update({
    where: { id: leadId },
    data: { notes: notes.trim() || null },
  });
  await appendLog({
    ...actor,
    action: "LEAD_NOTES_SAVED",
    entity: "lead",
    entityId: leadId,
    entityTitle: lead ? `${lead.name} — ${lead.company}` : leadId,
  });

  revalidatePath("/admin/leads");
}

export type LeadRow = {
  id: string;
  name: string;
  email: string;
  company: string;
  website: string | null;
  type: string;
  region: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
};

export async function fetchLeadsAction(params: {
  search?: string;
  status?: string;
  skip?: number;
  pageSize?: number;
}): Promise<{ leads: LeadRow[]; hasMore: boolean }> {
  const session = await auth();
  requireAuth(session?.role);

  const {
    search = "",
    status = "all",
    skip = 0,
    pageSize = PAGE_SIZE,
  } = params;
  const safePage = Math.min(pageSize, 200);
  const q = search.trim();

  const where = {
    ...(status !== "all" ? { status } : {}),
    ...(q
      ? {
          OR: [
            { company: { contains: q, mode: "insensitive" as const } },
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const rows = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take: safePage + 1,
  });

  const hasMore = rows.length > safePage;
  return { leads: rows.slice(0, safePage) as LeadRow[], hasMore };
}

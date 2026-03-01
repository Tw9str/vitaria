"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prismaClient";
import { appendLog } from "@/lib/logger";

export async function createNoteAction(content: string): Promise<void> {
  const session = await auth();
  requireAuth(session?.role);
  const actor = {
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name,
  };

  const trimmed = content.trim();
  if (!trimmed) return;

  const note = await prisma.note.create({ data: { content: trimmed } });
  void appendLog({
    ...actor,
    action: "NOTE_CREATED",
    entity: "note",
    entityId: note.id,
    entityTitle: trimmed.slice(0, 60),
  });
  revalidatePath("/admin");
}

export async function updateNoteAction(
  id: string,
  content: string,
): Promise<void> {
  const session = await auth();
  requireAuth(session?.role);
  const actor = {
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name,
  };

  await prisma.note.update({
    where: { id },
    data: { content: content.trim() },
  });
  void appendLog({
    ...actor,
    action: "NOTE_UPDATED",
    entity: "note",
    entityId: id,
    entityTitle: content.trim().slice(0, 60),
  });

  revalidatePath("/admin");
}

export async function deleteNoteAction(id: string): Promise<void> {
  const session = await auth();
  requireAuth(session?.role);
  const actor = {
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name,
  };

  await prisma.note.delete({ where: { id } });
  void appendLog({
    ...actor,
    action: "NOTE_DELETED",
    entity: "note",
    entityId: id,
    severity: "warning",
  });
  revalidatePath("/admin");
}

export async function toggleNotePinAction(
  id: string,
  pinned: boolean,
): Promise<void> {
  const session = await auth();
  requireAuth(session?.role);
  const actor = {
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name,
  };

  await prisma.note.update({ where: { id }, data: { pinned } });
  void appendLog({
    ...actor,
    action: pinned ? "NOTE_PINNED" : "NOTE_UNPINNED",
    entity: "note",
    entityId: id,
  });
  revalidatePath("/admin");
}

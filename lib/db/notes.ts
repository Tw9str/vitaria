import { prisma } from "@/lib/prismaClient";

export type NoteItem = {
  id: string;
  content: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function getNotes(): Promise<NoteItem[]> {
  return prisma.note.findMany({
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });
}

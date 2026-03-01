import { prisma } from "@/lib/prismaClient";

/** Admin: most-recent leads, capped for the overview page. */
export async function getRecentLeads(take = 50) {
  try {
    return await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take,
    });
  } catch (cause) {
    throw new Error("Failed to load leads.", { cause });
  }
}

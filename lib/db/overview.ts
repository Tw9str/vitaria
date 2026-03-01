import { prisma } from "@/lib/prismaClient";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OverviewStats = {
  totalProducts: number;
  publishedCount: number;
  draftCount: number;
  totalLeads: number;
  newLeadsCount: number;
  weekLeadsCount: number;
};

export type RecentLead = {
  id: string;
  name: string;
  company: string;
  type: string;
  status: string;
  createdAt: Date;
};

export type DraftProduct = {
  id: string;
  title: string;
};

export type OverviewData = {
  stats: OverviewStats;
  recentLeads: RecentLead[];
  draftProducts: DraftProduct[];
  /** Per-day lead counts for the last 7 days, oldest first. */
  sparkCounts: number[];
  firstName: string;
};

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

const RECENT_LEADS_TAKE = 8;
const DRAFT_PRODUCTS_TAKE = 8;
const SPARKLINE_DAYS = 7;

export async function getOverviewData(email: string): Promise<OverviewData> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - SPARKLINE_DAYS * 86_400_000);

  const [
    totalProducts,
    publishedCount,
    totalLeads,
    newLeadsCount,
    weekLeadsCount,
    recentLeads,
    draftProducts,
    sparkRaw,
    me,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "new" } }),
    prisma.lead.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: RECENT_LEADS_TAKE,
      select: {
        id: true,
        name: true,
        company: true,
        type: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.product.findMany({
      where: { published: false },
      orderBy: { updatedAt: "desc" },
      take: DRAFT_PRODUCTS_TAKE,
      select: { id: true, title: true },
    }),
    prisma.lead.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.user.findUnique({
      where: { email },
      select: { name: true },
    }),
  ]);

  // Build per-day sparkline buckets (index 0 = 6 days ago, index 6 = today).
  const sparkCounts = Array.from({ length: SPARKLINE_DAYS }, (_, i) => {
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - (SPARKLINE_DAYS - 1 - i));
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return sparkRaw.filter(
      (l) => l.createdAt >= dayStart && l.createdAt < dayEnd,
    ).length;
  });

  return {
    stats: {
      totalProducts,
      publishedCount,
      draftCount: totalProducts - publishedCount,
      totalLeads,
      newLeadsCount,
      weekLeadsCount,
    },
    recentLeads,
    draftProducts,
    sparkCounts,
    firstName: (me?.name ?? email).split(" ")[0],
  };
}

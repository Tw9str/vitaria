export const LEAD_STATUSES = ["new", "read", "contacted", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

import { prisma } from "@/lib/prismaClient";

export type LogSeverity = "info" | "warning" | "error";

export interface LogPayload {
  action: string;
  entity: string;
  entityId?: string;
  entityTitle?: string;
  actorEmail: string;
  actorName?: string | null;
  severity?: LogSeverity;
  detail?: string;
}

/**
 * Write an activity / error log entry to the database.
 * Errors are swallowed so a logging failure never breaks the actual operation.
 */
export async function appendLog(payload: LogPayload): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        action: payload.action,
        entity: payload.entity,
        entityId: payload.entityId ?? null,
        entityTitle: payload.entityTitle ?? null,
        actorEmail: payload.actorEmail,
        actorName: payload.actorName ?? null,
        severity: payload.severity ?? "info",
        detail: payload.detail ?? null,
      },
    });
  } catch (err) {
    console.error("[logger] Failed to write log:", err);
  }
}

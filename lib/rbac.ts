import type { Role } from "@prisma/client";

/**
 * Throws if `role` does not match the required role.
 * Use in Server Actions and Route Handlers after calling `auth()`.
 *
 * @example
 * const session = await auth();
 * requireRole(session?.role, "admin");
 */
export function requireRole(role: Role | undefined, required: Role): void {
  if (role !== required) throw new Error("FORBIDDEN");
}

/** Convenience alias — most restricted check. */
export const requireAdmin = (role: Role | undefined) =>
  requireRole(role, "admin");

/**
 * Throws if the user is not authenticated at all (i.e. has no role).
 * Allows both "admin" and "editor" — use for actions available to all staff.
 *
 * @example
 * const session = await auth();
 * requireAuth(session?.role);
 */
export function requireAuth(role: Role | undefined): void {
  if (!role) throw new Error("FORBIDDEN");
}

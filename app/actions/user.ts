"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prismaClient";
import { requireAdmin } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { appendLog } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAdminSession() {
  const session = await auth();
  requireAdmin(session?.role);
  return session!;
}

// ---------------------------------------------------------------------------
// Create user
// ---------------------------------------------------------------------------

export type CreateUserState = {
  fieldErrors?: { email?: string[] };
  formError?: string;
  success?: boolean;
} | null;

const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .toLowerCase(),
  role: z.enum(["admin", "editor"]).default("editor"),
});

export async function createUserAction(
  _prev: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  const actorSession = await getAdminSession();

  const raw = {
    email: String(formData.get("email") ?? "").trim(),
    role: String(formData.get("role") ?? "editor"),
  };

  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: { email?: string[] } = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as "email" | undefined;
      if (field) {
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field]!.push(issue.message);
      }
    }
    return { fieldErrors };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existing) {
    return {
      fieldErrors: { email: ["A user with this email already exists."] },
    };
  }

  try {
    await prisma.user.create({
      data: {
        email: parsed.data.email,
        role: parsed.data.role as Role,
      },
    });
  } catch {
    return { formError: "Failed to create user. Please try again." };
  }

  void appendLog({
    actorEmail: actorSession?.user?.email ?? "unknown",
    actorName: actorSession?.user?.name ?? undefined,
    action: "USER_CREATED",
    entity: "user",
    entityTitle: parsed.data.email,
    detail: `Role: ${parsed.data.role}`,
  });

  revalidatePath("/admin/users");
  return { success: true };
}

// ---------------------------------------------------------------------------
// Update user name
// ---------------------------------------------------------------------------

export async function updateUserNameAction(
  userId: string,
  name: string,
): Promise<{ error?: string }> {
  const session = await getAdminSession();

  const trimmed = name.trim();
  if (trimmed.length > 120) return { error: "Name is too long." };

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { name: trimmed || null },
    });
    void appendLog({
      actorEmail: session?.user?.email ?? "unknown",
      actorName: session?.user?.name ?? undefined,
      action: "USER_RENAMED",
      entity: "user",
      entityId: userId,
      entityTitle: user?.email ?? userId,
      detail: `Name → "${trimmed}"`,
    });
  } catch {
    return { error: "Failed to update name." };
  }

  revalidatePath("/admin/users");
  return {};
}

// ---------------------------------------------------------------------------
// Update user role
// ---------------------------------------------------------------------------

export async function updateUserRoleAction(
  userId: string,
  role: Role,
): Promise<{ error?: string }> {
  const session = await getAdminSession();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    void appendLog({
      actorEmail: session?.user?.email ?? "unknown",
      actorName: session?.user?.name ?? undefined,
      action: "USER_ROLE_CHANGED",
      entity: "user",
      entityId: userId,
      entityTitle: user?.email ?? userId,
      detail: `Role → ${role}`,
    });
  } catch {
    return { error: "Failed to update role." };
  }

  revalidatePath("/admin/users");
  return {};
}

// ---------------------------------------------------------------------------
// Delete user
// ---------------------------------------------------------------------------

export async function deleteUserAction(
  userId: string,
): Promise<{ error?: string }> {
  const session = await getAdminSession();

  // Prevent self-deletion
  const selfEmail = session.user?.email ?? "";
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (target?.email && target.email === selfEmail) {
    return { error: "You cannot delete your own account." };
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch {
    return { error: "Failed to delete user." };
  }

  void appendLog({
    actorEmail: session?.user?.email ?? "unknown",
    actorName: session?.user?.name ?? undefined,
    action: "USER_DELETED",
    entity: "user",
    entityId: userId,
    entityTitle: target?.email ?? undefined,
    severity: "warning",
  });

  revalidatePath("/admin/users");
  return {};
}

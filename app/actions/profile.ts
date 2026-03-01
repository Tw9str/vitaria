"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prismaClient";
import { profileSchema, type ProfileInput } from "@/lib/validators";
import { deleteStorageKeys } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { appendLog } from "@/lib/logger";

export type ProfileFieldErrors = Partial<Record<keyof ProfileInput, string[]>>;

export type ProfileActionState = {
  fieldErrors?: ProfileFieldErrors;
  formError?: string;
  success?: boolean;
} | null;

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.email) return { formError: "Not authenticated." };

  const oldImage = String(formData.get("oldImage") ?? "").trim();

  const raw = {
    name: String(formData.get("name") ?? "").trim(),
    image: String(formData.get("image") ?? "").trim() || undefined,
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: ProfileFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof ProfileFieldErrors | undefined;
      if (field) {
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field]!.push(issue.message);
      }
    }
    return { fieldErrors };
  }

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: parsed.data.name,
        image: parsed.data.image ?? null,
      },
    });
  } catch {
    return { formError: "Failed to save changes. Please try again." };
  }

  // Delete old avatar from R2 if a new one was uploaded in its place
  if (oldImage && oldImage !== parsed.data.image) {
    void deleteStorageKeys([oldImage]);
  }

  void appendLog({
    actorEmail: session.user.email,
    actorName: parsed.data.name,
    action: "PROFILE_UPDATED",
    entity: "profile",
    entityTitle: parsed.data.name,
    detail:
      parsed.data.image && parsed.data.image !== oldImage
        ? "Name and avatar updated"
        : "Name updated",
  });

  revalidatePath("/admin/profile");
  return { success: true };
}

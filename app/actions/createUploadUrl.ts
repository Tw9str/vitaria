"use server";

import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prismaClient";
import {
  presignProductImageUploads as _presignUploads,
  presignAvatarUpload as _presignAvatar,
  presignViewUrls as _presignViews,
  deleteStorageKeys as _deleteKeys,
  type FileDescriptor,
} from "@/lib/storage";

/**
 * Server Action: generate presigned upload + view URLs for product images.
 * Called from the ProductEditor client component.
 */
export async function presignProductImageUploads(input: {
  productId: string;
  files: FileDescriptor[];
}) {
  const session = await auth();
  requireAdmin(session?.role);
  return _presignUploads(input.productId, input.files);
}

/**
 * Server Action: generate presigned view URLs for existing R2 keys.
 * Called from any client component that needs to display stored images.
 */
export async function presignViewUrls(input: { keys: string[] }) {
  const session = await auth();
  requireAdmin(session?.role);
  return _presignViews(input.keys);
}

/**
 * Server Action: generate a presigned upload URL for the current user's avatar.
 * Auth-gated — always uses the session user's ID as the storage path.
 */
export async function presignAvatarUploadAction(file: FileDescriptor) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Not authenticated.");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) throw new Error("User not found.");

  return _presignAvatar(user.id, file);
}

/**
 * Server Action: delete one or more R2 objects by key.
 * Used by the editor to immediately remove replaced/removed images from storage.
 */
export async function deleteStorageKeysAction(keys: string[]) {
  const session = await auth();
  requireAdmin(session?.role);
  await _deleteKeys(keys);
}

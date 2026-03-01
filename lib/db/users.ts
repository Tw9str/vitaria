import { prisma } from "@/lib/prismaClient";

export type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "admin" | "editor";
  createdAt: Date;
};

export async function getAllUsers(): Promise<UserRow[]> {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

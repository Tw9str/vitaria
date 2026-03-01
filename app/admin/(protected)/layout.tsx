import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prismaClient";
import { presignViewUrls } from "@/lib/storage";
import AdminShell from "@/components/admin/AdminShell";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const email = session.user?.email ?? "";
  const dbUser = email
    ? await prisma.user.findUnique({
        where: { email },
        select: { name: true, email: true, image: true, role: true },
      })
    : null;

  let imageViewUrl: string | null = null;
  if (dbUser?.image) {
    const [signed] = await presignViewUrls([dbUser.image]).catch(() => []);
    imageViewUrl = signed?.viewUrl ?? null;
  }

  return (
    <AdminShell
      user={{
        name: dbUser?.name ?? null,
        email: dbUser?.email ?? email,
        imageUrl: imageViewUrl,
        role: dbUser?.role ?? "editor",
      }}
    >
      {children}
    </AdminShell>
  );
}

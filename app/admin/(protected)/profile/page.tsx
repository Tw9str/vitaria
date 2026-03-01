import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prismaClient";
import { presignViewUrls } from "@/lib/storage";
import ProfileEditor from "@/components/admin/ProfileEditor";

export default async function Profile() {
  const session = await auth();
  const email = session?.user?.email ?? "";

  const user = email
    ? await prisma.user.findUnique({
        where: { email },
        select: {
          name: true,
          email: true,
          image: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
      })
    : null;

  // Presign a view URL for the stored R2 avatar key (if any)
  let imageViewUrl: string | null = null;
  if (user?.image) {
    const [signed] = await presignViewUrls([user.image]).catch(() => []);
    imageViewUrl = signed?.viewUrl ?? null;
  }

  return (
    <ProfileEditor
      name={user?.name ?? null}
      email={user?.email ?? email}
      image={user?.image ?? null}
      imageViewUrl={imageViewUrl}
      role={user?.role ?? "editor"}
      emailVerified={user?.emailVerified ?? null}
      createdAt={user?.createdAt ?? new Date()}
    />
  );
}

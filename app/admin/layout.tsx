import type { Metadata } from "next";
import ThemeBootstrap from "@/components/shared/ThemeBootsrap";

export const metadata: Metadata = {
  title: "Vitaria Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeBootstrap />
      {children}
    </>
  );
}

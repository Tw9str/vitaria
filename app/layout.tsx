import "./globals.css";
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="text-white/90 antialiased">{children}</body>
    </html>
  );
}

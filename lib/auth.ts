import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prismaClient";
import { sendEmail } from "@/lib/email";
import { SITE } from "@/lib/site";
import type { Role } from "@prisma/client";
import { config } from "./config";

// ---------------------------------------------------------------------------
// Module augmentation — adds `role` to the session/JWT types
// ---------------------------------------------------------------------------
declare module "next-auth" {
  interface Session extends DefaultSession {
    role: Role;
  }
  interface JWT {
    role: Role;
  }
}

// ---------------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    Resend({
      apiKey: config.resend.resendApiKey,
      from: config.resend.fromEmail,
      async sendVerificationRequest({ identifier: email, url }) {
        // Only send the magic link if the email belongs to an existing user.
        // Silently skip unknown addresses so we don't leak who is registered.
        const existing = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: { id: true },
        });
        if (!existing) return;
        console.log(url);
        await sendEmail({
          to: email,
          subject: `Sign in to ${SITE.name} admin`,
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8" /><title>Sign in</title></head>
            <body style="margin:0;padding:40px 16px;background:#0b0f12;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e8e4d8;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
                    <tr>
                      <td style="padding-bottom:24px;">
                        <span style="font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c9a35a;">${SITE.name}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#161b1f;border:1px solid #2a2e32;border-radius:16px;padding:32px;text-align:center;">
                        <h2 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#e8e4d8;">Sign in</h2>
                        <p style="margin:0 0 24px;font-size:13px;color:#9a9488;">
                          Click the button below to sign in to the ${SITE.name} admin panel.<br/>
                          This link expires in 10 minutes.
                        </p>
                        <a href="${url}" style="display:inline-block;background:#c9a35a;color:#000;font-size:13px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:999px;">
                          Sign in to ${SITE.name}
                        </a>
                        <p style="margin:24px 0 0;font-size:11px;color:#9a9488;">
                          If you didn't request this, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
          `,
        });
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      // Hard gate: reject sign-in for any email not already in the DB.
      // This guards against edge cases where a token was issued before the
      // user-existence check was in place, or direct API abuse.
      if (!user?.email) return false;
      const existing = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() },
        select: { id: true },
      });
      return !!existing;
    },

    async jwt({ token, user }) {
      // Attach role on first sign-in; subsequent requests read from the token.
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { role: true },
        });
        token.role = (dbUser?.role ?? "editor") as Role;
      }
      return token;
    },

    async session({ session, token }) {
      session.role = (token.role ?? "editor") as Role;
      return session;
    },
  },

  pages: { signIn: "/admin/login", error: "/admin/login" },
});

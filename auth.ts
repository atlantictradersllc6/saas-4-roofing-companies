import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Resend from "next-auth/providers/resend";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { NeonAdapter } from "@/lib/auth-adapter";

/**
 * Auth.js (NextAuth v5) configuration.
 *
 * Providers (each activates only when its keys exist, so nothing breaks early):
 *   - Email + password (Credentials) — always on
 *   - Google / GitHub — when AUTH_GOOGLE_* / AUTH_GITHUB_* are set
 *   - Magic link (Resend) — when AUTH_RESEND_KEY is set
 *
 * JWT sessions carry the user's id, company_id (multi-tenancy) and role. The
 * Neon adapter persists OAuth/magic-link users (and creates their company).
 */

export const oauthEnabled = {
  google: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  github: !!(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET),
};
export const emailEnabled = !!process.env.AUTH_RESEND_KEY;

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "Email",
    credentials: { email: {}, password: {} },
    async authorize(creds) {
      const email = String(creds?.email ?? "").toLowerCase().trim();
      const password = String(creds?.password ?? "");
      if (!email || !password || !sql) return null;

      const rows = await sql`
        select id, email, name, password_hash, company_id, role
        from users where email = ${email} limit 1
      `;
      const u = rows[0];
      if (!u || !u.password_hash) return null;
      const ok = await bcrypt.compare(password, u.password_hash as string);
      if (!ok) return null;

      return {
        id: u.id as string,
        email: u.email as string,
        name: (u.name as string) ?? null,
        companyId: u.company_id as string,
        role: u.role as string,
      };
    },
  }),
];

if (oauthEnabled.google) providers.push(Google);
if (oauthEnabled.github) providers.push(GitHub);
if (emailEnabled)
  providers.push(
    Resend({ from: process.env.PROPOSAL_FROM || "onboarding@resend.dev" }),
  );

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: sql ? NeonAdapter() : undefined,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      // Credentials sign-in carries our fields directly; adapter (OAuth /
      // magic-link) users only carry an id, so we load company + role by id.
      if (user) {
        token.uid = user.id;
        token.companyId = (user as { companyId?: string }).companyId;
        token.role = (user as { role?: string }).role;
      }
      if (token.uid && !token.companyId && sql) {
        const rows = await sql`
          select company_id, role from users where id = ${token.uid} limit 1
        `;
        if (rows[0]) {
          token.companyId = rows[0].company_id as string;
          token.role = rows[0].role as string;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.companyId = token.companyId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});

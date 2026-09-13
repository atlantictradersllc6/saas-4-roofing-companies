import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

/**
 * Auth.js (NextAuth v5) configuration.
 *
 * - Email + password (Credentials) always available.
 * - Google / GitHub added ONLY when their keys are present, so the app never
 *   crashes before you configure them (and the login page hides missing ones).
 * - JWT sessions (no DB session table). The token carries the user's id, their
 *   company_id (multi-tenancy!), and role. On OAuth first sign-in we create a
 *   company + user on the fly.
 */

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

export const oauthEnabled = {
  google: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  github: !!(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET),
};
if (oauthEnabled.google) providers.push(Google);
if (oauthEnabled.github) providers.push(GitHub);

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      // Credentials sign-in: `user` already carries our fields.
      if (user) {
        token.uid = (user as { id?: string }).id;
        token.companyId = (user as { companyId?: string }).companyId;
        token.role = (user as { role?: string }).role;
      }

      // OAuth sign-in: make sure a user + company exist, then load them.
      if (account && account.provider !== "credentials" && token.email && sql) {
        const email = String(token.email).toLowerCase();
        let rows = await sql`
          select id, company_id, role from users where email = ${email} limit 1
        `;
        if (!rows[0]) {
          const base = token.name || email.split("@")[0];
          const comp = await sql`
            insert into companies (name) values (${base + "'s company"}) returning id
          `;
          const companyId = comp[0].id as string;
          rows = await sql`
            insert into users (company_id, email, name, role, image, email_verified)
            values (${companyId}, ${email}, ${token.name ?? null}, 'owner', ${token.picture ?? null}, now())
            returning id, company_id, role
          `;
          await sql`
            insert into accounts (user_id, provider, provider_account_id)
            values (${rows[0].id}, ${account.provider}, ${account.providerAccountId})
            on conflict do nothing
          `;
        }
        token.uid = rows[0].id;
        token.companyId = rows[0].company_id;
        token.role = rows[0].role;
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

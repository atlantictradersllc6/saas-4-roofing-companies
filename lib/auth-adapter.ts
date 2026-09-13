import type { Adapter, AdapterUser } from "@auth/core/adapters";
import { sql } from "./db";

/**
 * Minimal Auth.js adapter backed by Neon.
 *
 * It persists what OAuth + magic-link sign-in need: users, linked OAuth
 * accounts, and email verification tokens. Sessions stay as JWTs (see auth.ts),
 * so no session table is needed.
 *
 * Key multi-tenancy touch: when a brand-new user signs in via Google/GitHub or
 * a magic link, `createUser` also spins up a company and makes them its owner —
 * that's their tenant.
 */
type Row = Record<string, unknown>;

function mapUser(r: Row): AdapterUser {
  return {
    id: r.id as string,
    email: r.email as string,
    name: (r.name as string) ?? null,
    image: (r.image as string) ?? null,
    emailVerified: r.email_verified ? new Date(r.email_verified as string) : null,
  };
}

export function NeonAdapter(): Adapter {
  const db = sql!; // only constructed when DATABASE_URL is set
  return {
    async createUser(user) {
      const base = user.name || user.email.split("@")[0];
      const comp = await db`
        insert into companies (name) values (${base + "'s company"}) returning id
      `;
      const rows = await db`
        insert into users (company_id, email, name, image, email_verified, role)
        values (${comp[0].id}, ${user.email}, ${user.name ?? null}, ${user.image ?? null},
                ${user.emailVerified ?? null}, 'owner')
        returning id, email, name, image, email_verified
      `;
      return mapUser(rows[0]);
    },
    async getUser(id) {
      const rows = await db`select id, email, name, image, email_verified from users where id = ${id} limit 1`;
      return rows[0] ? mapUser(rows[0]) : null;
    },
    async getUserByEmail(email) {
      const rows = await db`select id, email, name, image, email_verified from users where email = ${email} limit 1`;
      return rows[0] ? mapUser(rows[0]) : null;
    },
    async getUserByAccount({ provider, providerAccountId }) {
      const rows = await db`
        select u.id, u.email, u.name, u.image, u.email_verified
        from accounts a join users u on u.id = a.user_id
        where a.provider = ${provider} and a.provider_account_id = ${providerAccountId}
        limit 1
      `;
      return rows[0] ? mapUser(rows[0]) : null;
    },
    async updateUser(user) {
      const rows = await db`
        update users set
          name = coalesce(${user.name ?? null}, name),
          image = coalesce(${user.image ?? null}, image),
          email_verified = coalesce(${user.emailVerified ?? null}, email_verified)
        where id = ${user.id}
        returning id, email, name, image, email_verified
      `;
      return mapUser(rows[0]);
    },
    async linkAccount(account) {
      await db`
        insert into accounts (user_id, provider, provider_account_id)
        values (${account.userId}, ${account.provider}, ${account.providerAccountId})
        on conflict (provider, provider_account_id) do nothing
      `;
      return account;
    },
    async createVerificationToken(token) {
      await db`
        insert into verification_tokens (identifier, token, expires)
        values (${token.identifier}, ${token.token}, ${token.expires})
      `;
      return token;
    },
    async useVerificationToken({ identifier, token }) {
      const rows = await db`
        delete from verification_tokens
        where identifier = ${identifier} and token = ${token}
        returning identifier, token, expires
      `;
      if (!rows[0]) return null;
      return {
        identifier: rows[0].identifier as string,
        token: rows[0].token as string,
        expires: new Date(rows[0].expires as string),
      };
    },
  };
}

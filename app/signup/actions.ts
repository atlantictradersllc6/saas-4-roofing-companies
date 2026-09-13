"use server";

import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { sql, isDbConfigured } from "@/lib/db";

export type SignupState = { error?: string };

export async function signup(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const name = String(formData.get("name") ?? "").trim();
  const companyName = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };
  if (!isDbConfigured() || !sql)
    return { error: "Database isn't configured on the server." };

  const existing = await sql`select 1 from users where email = ${email} limit 1`;
  if (existing[0])
    return { error: "An account with that email already exists." };

  // A new sign-up creates its own company (this user becomes its owner) —
  // that's the tenant boundary for multi-tenancy.
  const hash = await bcrypt.hash(password, 10);
  const fallback = (name || email.split("@")[0]) + "'s company";
  const comp = await sql`
    insert into companies (name) values (${companyName || fallback}) returning id
  `;
  const companyId = comp[0].id as string;
  await sql`
    insert into users (company_id, email, name, password_hash, role, email_verified)
    values (${companyId}, ${email}, ${name || null}, ${hash}, 'owner', now())
  `;

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
    return {};
  } catch (err) {
    if (err instanceof AuthError) return { error: "Account created — please sign in." };
    throw err;
  }
}

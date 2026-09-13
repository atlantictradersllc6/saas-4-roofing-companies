"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export type LoginState = { error?: string };

export async function loginWithPassword(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/dashboard",
    });
    return {};
  } catch (err) {
    // A successful sign-in throws a redirect — let it propagate.
    if (err instanceof AuthError) return { error: "Invalid email or password." };
    throw err;
  }
}

export type MagicState = { error?: string; sent?: boolean };

export async function loginWithEmail(
  _prev: MagicState,
  formData: FormData,
): Promise<MagicState> {
  const email = String(formData.get("magicEmail") ?? "").toLowerCase().trim();
  if (!email) return { error: "Enter your email." };
  try {
    // Sends the sign-in link and redirects to the "check your email" page.
    await signIn("resend", { email, redirectTo: "/dashboard" });
    return { sent: true };
  } catch (err) {
    if (err instanceof AuthError) return { error: "Could not send the sign-in link." };
    throw err;
  }
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function loginWithGitHub() {
  await signIn("github", { redirectTo: "/dashboard" });
}

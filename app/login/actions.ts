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

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function loginWithGitHub() {
  await signIn("github", { redirectTo: "/dashboard" });
}

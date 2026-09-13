"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  loginWithPassword,
  loginWithGoogle,
  loginWithGitHub,
  loginWithEmail,
} from "@/app/login/actions";
import { IconRoof } from "./icons";

export default function LoginForm({
  oauth,
  emailLink,
}: {
  oauth: { google: boolean; github: boolean };
  emailLink: boolean;
}) {
  const [state, formAction, pending] = useActionState(loginWithPassword, {});
  const [magic, magicAction, magicPending] = useActionState(loginWithEmail, {});

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand">
          <div className="brand-mark"><IconRoof /></div>
          <div>
            <div className="brand-name">Ridgeline</div>
            <div className="brand-sub">Roofing OS</div>
          </div>
        </div>
        <h1>Sign in</h1>
        <p>Welcome back. Sign in to your company workspace.</p>

        {(oauth.google || oauth.github) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {oauth.google && (
              <form action={loginWithGoogle}>
                <button className="btn block" type="submit">Continue with Google</button>
              </form>
            )}
            {oauth.github && (
              <form action={loginWithGitHub}>
                <button className="btn block" type="submit">Continue with GitHub</button>
              </form>
            )}
            <div className="or-divider"><span>or</span></div>
          </div>
        )}

        <form action={formAction}>
          <input className="input" type="email" name="email" placeholder="you@company.com" required autoComplete="email" />
          <input className="input" type="password" name="password" placeholder="Password" required autoComplete="current-password" />
          {state.error && (
            <div style={{ color: "var(--bad)", fontSize: 13, marginBottom: 12 }}>{state.error}</div>
          )}
          <button className="btn primary block" type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {emailLink && (
          <>
            <div className="or-divider" style={{ margin: "16px 0" }}><span>or get a magic link</span></div>
            {magic.sent ? (
              <div className="note-box" style={{ color: "var(--good)", textAlign: "center" }}>
                Check your inbox for a sign-in link.
              </div>
            ) : (
              <form action={magicAction}>
                <input className="input" type="email" name="magicEmail" placeholder="you@company.com" required autoComplete="email" />
                {magic.error && (
                  <div style={{ color: "var(--bad)", fontSize: 13, marginBottom: 12 }}>{magic.error}</div>
                )}
                <button className="btn block" type="submit" disabled={magicPending}>
                  {magicPending ? "Sending…" : "Email me a sign-in link"}
                </button>
              </form>
            )}
          </>
        )}

        <p style={{ marginTop: 18, marginBottom: 0 }}>
          No account? <Link href="/signup" style={{ color: "var(--clay-ink)", fontWeight: 600 }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

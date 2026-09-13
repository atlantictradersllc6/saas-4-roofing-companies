"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/signup/actions";
import { IconRoof } from "./icons";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, {});

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
        <h1>Create your workspace</h1>
        <p>Start a new company account — you'll be its owner.</p>

        <form action={formAction}>
          <input className="input" type="text" name="company" placeholder="Company name (e.g. Summit Ridge Roofing)" autoComplete="organization" />
          <input className="input" type="text" name="name" placeholder="Your name" autoComplete="name" />
          <input className="input" type="email" name="email" placeholder="you@company.com" required autoComplete="email" />
          <input className="input" type="password" name="password" placeholder="Password (min 8 characters)" required minLength={8} autoComplete="new-password" />
          {state.error && (
            <div style={{ color: "var(--bad)", fontSize: 13, marginBottom: 12 }}>{state.error}</div>
          )}
          <button className="btn primary block" type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create workspace"}
          </button>
        </form>

        <p style={{ marginTop: 18, marginBottom: 0 }}>
          Already have an account? <Link href="/login" style={{ color: "var(--clay-ink)", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

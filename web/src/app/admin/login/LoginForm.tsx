"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    login,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="field-input"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-ink-muted"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field-input"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-red-300">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={isPending} className="btn-primary w-full">
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

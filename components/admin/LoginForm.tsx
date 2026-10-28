"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? "Sign in failed.");
        setBusy(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Network error. Is the server running?");
      setBusy(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      <div>
        <label className="admin-label" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          className="admin-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoFocus
        />
      </div>

      {error ? (
        <p className="admin-status admin-status--error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="admin-save" type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

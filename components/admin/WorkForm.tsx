"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { AdminWork } from "@/lib/works";

type SaveState = {
  tone: "ok" | "warn" | "error";
  text: string;
} | null;

export default function WorkForm({ work }: { work: AdminWork }) {
  const router = useRouter();

  const [title, setTitle] = useState(work.title);
  const [subtitle, setSubtitle] = useState(work.subtitle);
  const [link, setLink] = useState(work.link);
  const [preview, setPreview] = useState(work.preview);
  const [provider, setProvider] = useState(work.provider);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<SaveState>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setState(null);

    try {
      const response = await fetch(`/api/admin/works/${work.slug}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, subtitle, link }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        preview?: string;
        provider?: string;
        resolved?: boolean;
      };

      if (!response.ok) {
        setState({
          tone: "error",
          text: data.error ?? "Could not save this design.",
        });
        return;
      }

      if (typeof data.preview === "string") setPreview(data.preview);
      if (data.provider === "behance" || data.provider === "drive") {
        setProvider(data.provider);
      } else if (data.provider === "other") {
        setProvider("other");
      }

      setState({
        tone: data.resolved ? "ok" : "warn",
        text: data.resolved
          ? "Saved — cover image pulled from the link."
          : "Saved — keeping the current cover image.",
      });

      router.refresh();
    } catch {
      setState({ tone: "error", text: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="admin-card">
      <div className="admin-preview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt={`${title} cover preview`}
          onError={() => setPreview(work.fallback)}
        />
        <span className={`admin-badge admin-badge--${provider}`}>
          {provider}
        </span>
        <span className="admin-index">{work.index}</span>
      </div>

      <form className="admin-card-body" onSubmit={onSubmit}>
        <div>
          <label className="admin-label" htmlFor={`${work.slug}-title`}>
            Title
          </label>
          <input
            id={`${work.slug}-title`}
            className="admin-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
            required
          />
        </div>

        <div>
          <label className="admin-label" htmlFor={`${work.slug}-subtitle`}>
            Subtitle
          </label>
          <input
            id={`${work.slug}-subtitle`}
            className="admin-input"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
            maxLength={120}
            required
          />
        </div>

        <div>
          <label className="admin-label" htmlFor={`${work.slug}-link`}>
            Link (Behance or Drive)
          </label>
          <input
            id={`${work.slug}-link`}
            className="admin-input"
            type="url"
            inputMode="url"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="https://www.behance.net/gallery/…"
            maxLength={800}
            required
          />
        </div>

        <div className="admin-actions">
          <span
            className={`admin-status admin-status--${state?.tone ?? "idle"}`}
            aria-live="polite"
          >
            {state?.text ?? (work.isCustomLink ? "Custom link" : "Default link")}
          </span>
          <button className="admin-save" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </article>
  );
}

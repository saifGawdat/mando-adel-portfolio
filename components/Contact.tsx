"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Letters from "./Letters";
import type { SiteContent } from "@/content/site";

export default function Contact({
  site,
  open,
  onClose,
}: {
  site: SiteContent;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      closeRef.current?.focus({ preventScroll: true });
      setCopied(false);
    }
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2600);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copy = useCallback(async () => {
    const legacyCopy = () => {
      const field = document.createElement("textarea");
      field.value = site.email;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(field);
      return ok;
    };

    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
    } catch {
      if (legacyCopy()) setCopied(true);
      else window.location.href = `mailto:${site.email}`;
    }
  }, [site.email]);

  return (
    <div
      id="contact"
      className={`${open ? "is-open" : ""}${copied ? " is-copied" : ""}`}
      role="dialog"
      aria-modal={open}
      aria-label="Contact"
      aria-hidden={!open}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <picture>
        <source media="(max-width: 767px)" srcSet={site.portraits.mobile} />
        <source media="(max-width: 1024px)" srcSet={site.portraits.tablet} />
        <img className="contact-bg" src={site.portraits.desktop} alt="" aria-hidden="true" />
      </picture>

      <div id="contact-nav">
        <a href="#header" onClick={onClose}>
          {site.name}
        </a>

        <button
          type="button"
          className="contact-close"
          onClick={onClose}
          ref={closeRef}
        >
          Close
        </button>
      </div>

      <div id="contact-center">
        <button
          type="button"
          id="contact-mail"
          className="h1"
          onClick={copy}
          aria-label={`Copy ${site.email} to clipboard`}
        >
          <Letters text={site.email.toUpperCase()} />
        </button>

        <span id="contact-copied" className="h1" aria-hidden="true">
          {"COPIED TO CLIPBOARD".split(" ").map((word) => (
            <span className="group" key={word}>
              <Letters text={word} noise={false} />
            </span>
          ))}
        </span>
      </div>

      <div id="contact-subtitle">
        {site.contact.subtitle.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>

      <div id="contact-footer">
        <div className="contact-socials">
          {site.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {social.label}
            </a>
          ))}
        </div>

        <span className="contact-meta">
          {site.location} — 2026
        </span>
      </div>

      <span className="sr-only" aria-live="polite">
        {copied ? "Email copied to clipboard" : ""}
      </span>
    </div>
  );
}

import type { WorkLink } from "@prisma/client";

import { site, type SiteContent, type Work } from "@/content/site";
import { prisma } from "@/lib/prisma";
import { detectProvider, parseLink, type LinkProvider } from "@/lib/thumbnail";

export type AdminWork = {
  slug: string;
  index: string;
  title: string;
  subtitle: string;
  link: string;
  provider: LinkProvider;
  preview: string;
  fallback: string;
  updatedAt: string | null;
  isCustomLink: boolean;
};

/**
 * Splits an edited project name into the two-line display lockup.
 * "ACME Studio" -> ["ACME", "STUDIO"], "ACME" -> ["ACME"].
 * A literal "|" in the title forces the line break.
 */
export function buildTitleLines(title: string, base?: Work): string[] {
  const clean = title.trim();

  if (base && clean === base.title) return base.titleLines;

  if (clean.includes("|")) {
    return clean
      .split("|")
      .map((line) => line.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, 3);
  }

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [clean.toUpperCase()];

  const midpoint = Math.ceil(words.length / 2);
  return [
    words.slice(0, midpoint).join(" ").toUpperCase(),
    words.slice(midpoint).join(" ").toUpperCase(),
  ];
}

export function providerFor(link: string): LinkProvider {
  const url = parseLink(link);
  return url ? detectProvider(url) : "other";
}

export async function ensureSeeded(): Promise<void> {
  await prisma.workLink.createMany({
    data: site.works.map((work, position) => ({
      slug: work.slug,
      position,
      title: work.title,
      titleLines: work.titleLines,
      subtitle: work.subtitle,
      link: work.href,
      provider: providerFor(work.href),
      imageUrl: null,
    })),
    skipDuplicates: true,
  });
}

function toAdminWork(base: Work, row: WorkLink): AdminWork {
  return {
    slug: base.slug,
    index: base.index,
    title: row.title,
    subtitle: row.subtitle,
    link: row.link,
    provider: providerFor(row.link),
    preview: row.imageUrl ?? base.image,
    fallback: base.image,
    updatedAt: row.updatedAt.toISOString(),
    isCustomLink: row.link !== base.href,
  };
}

export async function getAdminWorks(): Promise<AdminWork[]> {
  await ensureSeeded();

  const rows = await prisma.workLink.findMany();
  const bySlug = new Map(rows.map((row) => [row.slug, row]));

  return site.works.map((base) => {
    const row = bySlug.get(base.slug);
    if (!row) throw new Error(`Missing work link row for "${base.slug}"`);
    return toAdminWork(base, row);
  });
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    await ensureSeeded();

    const rows = await prisma.workLink.findMany();
    const bySlug = new Map(rows.map((row) => [row.slug, row]));

    const works: Work[] = site.works.map((base) => {
      const row = bySlug.get(base.slug);
      if (!row) return base;

      return {
        ...base,
        title: row.title,
        titleLines: row.titleLines.length ? row.titleLines : base.titleLines,
        subtitle: row.subtitle,
        href: row.link,
        image: row.imageUrl ?? base.image,
        alt: `${row.title} — ${row.subtitle}`,
      };
    });

    return { ...site, works };
  } catch (error) {
    console.error("[works] falling back to static content:", error);
    return site;
  }
}

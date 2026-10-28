import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { site } from "@/content/site";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseLink, resolveThumbnail } from "@/lib/thumbnail";
import { buildTitleLines, providerFor } from "@/lib/works";

const MAX_TITLE = 80;
const MAX_SUBTITLE = 120;
const MAX_LINK = 800;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { slug } = await params;
  const base = site.works.find((work) => work.slug === slug);
  if (!base) {
    return NextResponse.json({ error: "Unknown project." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const payload = body as { title?: unknown; subtitle?: unknown; link?: unknown };
  const title = typeof payload?.title === "string" ? payload.title.trim() : "";
  const subtitle =
    typeof payload?.subtitle === "string" ? payload.subtitle.trim() : "";
  const link = typeof payload?.link === "string" ? payload.link.trim() : "";

  if (!title || title.length > MAX_TITLE) {
    return NextResponse.json(
      { error: `Title must be 1–${MAX_TITLE} characters.` },
      { status: 422 },
    );
  }

  if (!subtitle || subtitle.length > MAX_SUBTITLE) {
    return NextResponse.json(
      { error: `Subtitle must be 1–${MAX_SUBTITLE} characters.` },
      { status: 422 },
    );
  }

  if (!parseLink(link) || link.length > MAX_LINK) {
    return NextResponse.json(
      { error: "Link must be a valid http(s) URL." },
      { status: 422 },
    );
  }

  const existing = await prisma.workLink.findUnique({ where: { slug } });
  const linkChanged = !existing || existing.link !== link;

  let imageUrl = existing?.imageUrl ?? null;
  let resolved = false;

  if (linkChanged) {
    const preview = await resolveThumbnail(link);
    imageUrl = preview;
    resolved = Boolean(preview);
  }

  const titleLines = buildTitleLines(title, base);
  const provider = providerFor(link);
  const position = Number.parseInt(base.index, 10) - 1;

  const row = await prisma.workLink.upsert({
    where: { slug },
    create: {
      slug,
      position,
      title,
      titleLines,
      subtitle,
      link,
      provider,
      imageUrl,
    },
    update: {
      position,
      title,
      titleLines,
      subtitle,
      link,
      provider,
      imageUrl,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");

  return NextResponse.json({
    ok: true,
    slug,
    title: row.title,
    subtitle: row.subtitle,
    link: row.link,
    titleLines: row.titleLines,
    provider,
    resolved,
    imageUrl: row.imageUrl,
    preview: row.imageUrl ?? base.image,
  });
}

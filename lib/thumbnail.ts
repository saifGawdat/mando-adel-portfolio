export type LinkProvider = "behance" | "drive" | "other";

const DRIVE_HOSTS = ["drive.google.com", "docs.google.com"];
const IMAGE_EXTENSION = /\.(png|jpe?g|webp|avif|gif)(\?|#|$)/i;

export function parseLink(value: string): URL | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url;
  } catch {
    return null;
  }
}

export function detectProvider(url: URL): LinkProvider {
  const host = url.hostname.toLowerCase();

  if (DRIVE_HOSTS.some((item) => host === item || host.endsWith(`.${item}`))) {
    return "drive";
  }

  if (host === "behance.net" || host.endsWith(".behance.net")) {
    return "behance";
  }

  return "other";
}

export function driveThumbnail(url: URL): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{10,})/,
    /\/d\/([a-zA-Z0-9_-]{10,})/,
    /[?&]id=([a-zA-Z0-9_-]{10,})/,
  ];

  for (const pattern of patterns) {
    const match = url.pathname.match(pattern) ?? url.search.match(pattern);
    if (match?.[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600`;
    }
  }

  return null;
}

function ogImageFromHtml(html: string): string | null {
  const match =
    html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    ) ??
    html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    );

  const image = match?.[1]?.replace(/&amp;/g, "&").trim();
  return image || null;
}

function firstBehanceModuleImage(markdown: string): string | null {
  const match = markdown.match(
    /!\[[^\]]*\]\((https:\/\/mir-s3-cdn-cf\.behance\.net\/[^\s)]+)\)/i,
  );
  return match?.[1] ?? null;
}

async function fetchBehanceDirect(url: URL): Promise<string | null> {
  try {
    const response = await fetch(url.toString(), {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (!response.ok) return null;

    return ogImageFromHtml(await response.text());
  } catch {
    return null;
  }
}

/**
 * Behance often answers bot requests with 403. Jina Reader proxies the page
 * and exposes the first project module image, which works as a cover.
 * If both paths fail we return null and the site keeps its fallback cover.
 */
async function fetchBehanceViaReader(url: URL): Promise<string | null> {
  try {
    const response = await fetch(`https://r.jina.ai/${url.toString()}`, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        accept: "text/plain",
      },
      signal: AbortSignal.timeout(25000),
      cache: "no-store",
    });

    if (!response.ok) return null;

    return firstBehanceModuleImage(await response.text());
  } catch {
    return null;
  }
}

async function behanceThumbnail(url: URL): Promise<string | null> {
  const direct = await fetchBehanceDirect(url);
  if (direct) return direct;
  return fetchBehanceViaReader(url);
}

/**
 * Returns a public preview image for a Behance or Drive link.
 * Drive folder links and Behance pages that block bots return null so the
 * site can fall back to the existing local cover.
 */
export async function resolveThumbnail(link: string): Promise<string | null> {
  const url = parseLink(link);
  if (!url) return null;

  const provider = detectProvider(url);

  if (provider === "drive") {
    return driveThumbnail(url);
  }

  if (provider === "behance") {
    return behanceThumbnail(url);
  }

  if (IMAGE_EXTENSION.test(url.pathname)) {
    return url.toString();
  }

  return null;
}

import type { Metadata, Viewport } from "next";

import { site } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mandoadel.com"),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description:
    "Mando Adel is a graphic designer and art director in Tanta, Egypt, building brand identities, type systems and social campaigns.",
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description:
      "Brand identity, art direction and social systems. Selected work from Tanta, Egypt.",
    type: "website",
    locale: "en_US",
    images: [{ url: site.portraits.desktop, width: 1681, height: 936, alt: site.portraitAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.role}`,
    images: [site.portraits.desktop],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#d50305",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}

        <noscript>
          <div className="noscript">
            This site uses scroll-driven motion. Everything is readable without
            it — enable JavaScript for the full experience.
          </div>
        </noscript>

        {/* filter definitions are injected next to this node by lib/noise.ts */}
        <svg id="filters" aria-hidden="true" focusable="false">
          <defs>
            <filter id="motion-blur-header">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0 0" />
            </filter>
          </defs>
        </svg>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: site.name,
              jobTitle: site.role,
              address: {
                "@type": "PostalAddress",
                addressLocality: "Tanta",
                addressCountry: "EG",
              },
              email: `mailto:${site.email}`,
              sameAs: site.socials.map((social) => social.href),
            }),
          }}
        />
      </body>
    </html>
  );
}

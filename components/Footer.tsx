import type { SiteContent } from "@/content/site";

export default function Footer({ site }: { site: SiteContent }) {
  return (
    <footer id="footer">
      <div id="footer-left">
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

      <div id="footer-right">
        <a href="#about">Scroll</a>
      </div>
    </footer>
  );
}

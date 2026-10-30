import type { SiteContent } from "@/content/site";

export default function Nav({
  site,
  onContact,
}: {
  site: SiteContent;
  onContact: () => void;
}) {
  return (
    <nav id="nav" aria-label="Primary">
      <a className="nav-name" href="#header">
        {site.name}
      </a>

      <div id="nav-social">
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

      <div id="nav-right">
        <button type="button" className="nav-contact" onClick={onContact}>
          
          Contact us
        </button>

        <div className="items">
          {site.nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

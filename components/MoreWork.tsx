import Letters from "./Letters";
import type { SiteContent } from "@/content/site";

export default function MoreWork({ site }: { site: SiteContent }) {
  return (
    <section
      id="archive"
      className="archive"
      data-step-section
      data-steps="1"
      data-label="Archive"
      data-reveal-section
      aria-labelledby="archive-title"
    >
      <div className="archive-left">
        <p className="eyebrow">{site.archive.meta}</p>

        <h2 className="h2 archive-title" id="archive-title">
          {site.archive.title.map((line) => (
            <span className="line" key={line}>
              <Letters text={line} />
            </span>
          ))}
        </h2>

        <p className="archive-meta">{site.archive.caption}</p>

        <ul className="archive-list">
          {site.archive.projects.map((project, index) => (
            <li key={project.title}>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="archive-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="archive-name">{project.title}</span>
                <span className="archive-sub">{project.subtitle}</span>
                <span className="archive-arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>

        <a
          className="archive-cta"
          href={site.socials[0].href}
          target="_blank"
          rel="noopener noreferrer"
        >
          All projects on Behance <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className="archive-media" aria-hidden="true">
        <img
          className="archive-img archive-img--small"
          src={site.archive.images[0]}
          alt=""
          loading="lazy"
          data-speed="-60"
        />
        <img
          className="archive-img archive-img--large"
          src={site.archive.images[1]}
          alt=""
          loading="lazy"
          data-speed="70"
        />
      </div>
    </section>
  );
}

import Letters from "./Letters";
import type { SiteContent } from "@/content/site";

export default function About({ site }: { site: SiteContent }) {
  return (
    <section
      id="about"
      className="about"
      data-step-section
      data-steps="1"
      data-label="About"
      data-reveal-section
      aria-labelledby="about-title"
    >
      <div className="about-left">
        <p className="eyebrow">{site.about.meta}</p>

        <p className="about-body">{site.about.body}</p>

        <ul className="about-roles">
          {site.about.roles.map((role) => (
            <li key={role.label}>
              <span>{role.label}</span>
              <span>{role.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <figure className="about-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <picture>
          <source media="(max-width: 767px)" srcSet={site.portraits.mobile} />
          <source media="(max-width: 1024px)" srcSet={site.portraits.tablet} />
          <img src={site.portraits.desktop} alt={site.portraitAlt} loading="lazy" />
        </picture>
      </figure>

      <div className="about-title-wrap">
        <h2
          className="h2 about-title"
          id="about-title"
          aria-label={site.about.title.join(" ")}
        >
          {site.about.title.map((line) => (
            <span className="line" key={line}>
              <Letters text={line} />
            </span>
          ))}
        </h2>

        <p className="about-caption" aria-hidden="true">
          {site.role} — {site.location}
        </p>
      </div>
    </section>
  );
}

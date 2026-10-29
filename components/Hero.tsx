import Letters from "./Letters";
import type { SiteContent } from "@/content/site";

export default function Hero({ site }: { site: SiteContent }) {
  return (
    <header
      id="header"
      className="header"
      data-step-section
      data-steps="1"
      data-label="Intro"
    >
      <div className="header-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <picture>
          <source media="(max-width: 767px)" srcSet={site.portraits.mobile} />
          <source media="(max-width: 1024px)" srcSet={site.portraits.tablet} />
          <img
            className="header-image"
            src={site.portraits.desktop}
            alt={site.portraitAlt}
            fetchPriority="high"
          />
        </picture>
      </div>
      <div className="header-scrim" aria-hidden="true" />

      <h1
        className="h1 header-title"
        aria-label={`${site.firstName} ${site.lastName}`}
      >
        {site.hero.words.map((word, wordIndex) => (
          <span className="word" key={wordIndex}>
            {word.groups.map((group) => (
              <span className="group" key={group.text}>
                <Letters text={group.text} mins={group.mins} />
              </span>
            ))}
          </span>
        ))}
      </h1>

      <div className="header-subtitle" aria-hidden="true">
        {site.hero.subtitle.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>

      <div className="header-mobile-content" aria-hidden="true">
        <span className="header-logo">MA</span>
        <span>{site.role}</span>
        <span>{site.location}</span>
      </div>
    </header>
  );
}

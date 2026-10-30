import Letters from "./Letters";
import type { Work } from "@/content/site";

export default function WorkSection({
  work,
  anchor,
}: {
  work: Work;
  anchor?: string;
}) {
  const title = (
    <div className="work-title">
      <h2
        className="h1"
        id={`${work.slug}-title`}
        aria-label={`${work.title} — ${work.subtitle}`}
      >
        <a
          className="work-title-link"
          href={work.href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
        >
          {work.titleLines.map((line, index) => (
            <span
              className={index ? "line line--indent" : "line"}
              key={line}
            >
              <Letters text={line} />
            </span>
          ))}
        </a>
      </h2>
    </div>
  );

  const card = (
    <a
      className="work-card"
      href={work.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${work.title} — open project on Behance`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={work.image}
        alt={work.alt}
        loading="lazy"
        style={{ objectPosition: work.cardFocus }}
      />
    </a>
  );

  const meta = (
    <div className="work-meta">
      {work.meta.map((item) => (
        <span key={item} className="work-meta-line">
          {item}
        </span>
      ))}

      <span className="work-location">( {work.index} )</span>

      <a
        className="work-link"
        href={work.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        View project <span aria-hidden="true">↗</span>
      </a>
    </div>
  );

  return (
    <section
      id={anchor ?? work.slug}
      className={`work work--${work.layout}`}
      data-step-section
      data-steps="2"
      data-mobile-steps="1"
      data-label={work.title}
      data-reveal-section
      aria-labelledby={`${work.slug}-title`}
    >
      <div className="work-media" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="work-media-image"
          src={work.image}
          alt=""
          loading="lazy"
          data-speed="90"
          style={{ objectPosition: work.focus }}
        />
      </div>

      {work.layout === "split" && (
        <>
          {title}
          <div className="work-right work-right--sticky">
            {meta}
            {card}
          </div>
        </>
      )}

      {work.layout === "cover" && (
        <>
          {card}
          <div className="work-right work-right--center">
            {title}
            {meta}
          </div>
        </>
      )}

      {work.layout === "panel" && (
        <>
          {card}
          <div className="work-left">{meta}</div>
          <div className="work-right work-right--bottom">{title}</div>
        </>
      )}
    </section>
  );
}

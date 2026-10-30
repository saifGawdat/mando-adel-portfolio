"use client";

import { playNoise, prefersReducedMotion } from "./noise";

/**
 * Phone/tablet entrance for the About section (the swipe deck, <=1024px).
 *
 * Timeline (seconds):
 *   0.00  title letters rise in line by line, each landing with the melting warp
 *   0.25  portrait is wiped open from the bottom while its image settles from a zoom
 *   0.75  caption fades up
 *   1.00  eyebrow, then the body copy
 *   1.20  role rows slide in one after another
 *
 * Web Animations API with `fill: "backwards"`: nothing is left on the elements
 * afterwards, the normal CSS state takes over, and desktop is never touched.
 */

const EASE = "cubic-bezier(0.19, 1, 0.22, 1)";

const TARGETS =
  ".about-title .letter, .about-caption, .about-card, .about-card img, " +
  ".about-left .eyebrow, .about-body, .about-roles li";

/** Cancel any running entrance animation (also used when leaving mobile). */
export function resetAbout(section: HTMLElement) {
  section
    .querySelectorAll<HTMLElement>(TARGETS)
    .forEach((el) => el.getAnimations().forEach((animation) => animation.cancel()));
}

const fadeUp = (el: Element | null, delayS: number, distance = 14) => {
  el?.animate(
    [
      { opacity: 0, transform: `translateY(${distance}px)` },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration: 800, delay: delayS * 1000, easing: EASE, fill: "backwards" },
  );
};

export function enterAbout(section: HTMLElement) {
  resetAbout(section);
  if (prefersReducedMotion()) return;

  /* ----------------------------------------------------------------- title */
  const lines = Array.from(
    section.querySelectorAll<HTMLElement>(".about-title .line"),
  );
  lines.forEach((line, lineIndex) => {
    const letters = Array.from(line.querySelectorAll<HTMLElement>(".letter"));
    letters.forEach((letter, index) => {
      const delay = lineIndex * 0.18 + index * 0.035;
      letter.animate(
        [
          { opacity: 0, transform: "translateY(38px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 900, delay: delay * 1000, easing: EASE, fill: "backwards" },
      );
      playNoise(letter, delay);
    });
  });

  /* -------------------------------------------------------------- portrait */
  const card = section.querySelector<HTMLElement>(".about-card");
  card?.animate(
    [{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)" }],
    { duration: 1100, delay: 250, easing: EASE, fill: "backwards" },
  );

  section.querySelector<HTMLElement>(".about-card img")?.animate(
    [{ transform: "scale(1.3)" }, { transform: "scale(1)" }],
    { duration: 1500, delay: 250, easing: EASE, fill: "backwards" },
  );

  /* ------------------------------------------------------------ text blocks */
  fadeUp(section.querySelector(".about-caption"), 0.75, 10);
  fadeUp(section.querySelector(".about-left .eyebrow"), 1.0, 10);
  fadeUp(section.querySelector(".about-body"), 1.1, 14);

  /* ----------------------------------------------------------------- roles */
  section
    .querySelectorAll<HTMLElement>(".about-roles li")
    .forEach((row, index) => {
      row.animate(
        [
          { opacity: 0, transform: "translateX(-26px)" },
          { opacity: 1, transform: "translateX(0)" },
        ],
        {
          duration: 700,
          delay: (1.2 + index * 0.09) * 1000,
          easing: EASE,
          fill: "backwards",
        },
      );
    });
}

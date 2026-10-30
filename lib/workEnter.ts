"use client";

import { playNoise, prefersReducedMotion } from "./noise";

/**
 * Phone/tablet entrance for a work section (the swipe deck, <=1024px).
 *
 * - the project card flies in from a side that depends on the project's order:
 *   1st from the left, 2nd from the right, 3rd from the bottom, then repeats
 * - the title is "typed" outward from the centre of each line, reusing the
 *   melting-type warp so it lands the same way the desktop letters do
 * - the meta lines fade up once the title has finished
 *
 * Everything uses the Web Animations API with `fill: "backwards"`, so nothing
 * is left behind on the elements: when an animation ends the CSS state takes
 * over again, and desktop styling is never touched.
 */

export type EnterFrom = "left" | "right" | "bottom";

const ORDER: EnterFrom[] = ["left", "right", "bottom"];

export const enterFromFor = (workIndex: number): EnterFrom =>
  ORDER[((workIndex % ORDER.length) + ORDER.length) % ORDER.length];

const EASE = "cubic-bezier(0.19, 1, 0.22, 1)";
const CARD_MS = 1200;
const TYPE_START = 0.45; // seconds before the first letter appears
const TYPE_STEP = 0.07; // seconds between each ring of letters

const animated = (section: HTMLElement) =>
  section.querySelectorAll<HTMLElement>(
    ".work-card, .work-meta, .work-title .letter",
  );

/** Cancel any running entrance animation (also used when leaving mobile). */
export function resetWork(section: HTMLElement) {
  animated(section).forEach((el) =>
    el.getAnimations().forEach((animation) => animation.cancel()),
  );
}

export function enterWork(section: HTMLElement, from: EnterFrom) {
  resetWork(section);
  if (prefersReducedMotion()) return;

  /* ------------------------------------------------------------------ card */
  const card = section.querySelector<HTMLElement>(".work-card");
  if (card) {
    const w = window.innerWidth * 1.1;
    const h = window.innerHeight * 1.1;
    const start =
      from === "left"
        ? `${-w}px 0px`
        : from === "right"
          ? `${w}px 0px`
          : `0px ${h}px`;

    // `translate` is separate from the card's `transform` (which centres it),
    // so the two compose and the centring is never disturbed
    card.animate([{ translate: start }, { translate: "0px 0px" }], {
      duration: CARD_MS,
      easing: EASE,
      fill: "backwards",
    });
  }

  /* ----------------------------------------------------------------- title */
  let lastReveal = TYPE_START;
  const lines = Array.from(
    section.querySelectorAll<HTMLElement>(".work-title .line"),
  );

  lines.forEach((line) => {
    const letters = Array.from(line.querySelectorAll<HTMLElement>(".letter"));
    const middle = (letters.length - 1) / 2;

    letters.forEach((letter, index) => {
      const delay = TYPE_START + Math.abs(index - middle) * TYPE_STEP;
      lastReveal = Math.max(lastReveal, delay);

      // hidden until its turn, then pops in; afterwards CSS (visible) rules
      letter.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 1,
        delay: delay * 1000,
        fill: "backwards",
      });
      playNoise(letter, delay);
    });
  });

  /* ------------------------------------------------------------------ meta */
  const meta = section.querySelector<HTMLElement>(".work-meta");
  if (meta) {
    meta.animate(
      [
        { opacity: 0, transform: "translateY(12px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 700,
        delay: (lastReveal + 0.1) * 1000,
        easing: EASE,
        fill: "backwards",
      },
    );
  }
}

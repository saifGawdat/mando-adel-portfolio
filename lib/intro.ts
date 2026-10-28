"use client";

import gsap from "gsap";
import { playNoise } from "./noise";

const OFFSETS = [
  { x: 100 },
  { y: 100 },
  { y: -100 },
  { x: 100 },
  { x: -100 },
  { y: -100 },
  { y: 100 },
  { x: 100 },
  { y: 100 },
];

/**
 * Hero entrance: each letter starts offset from its final position and lands on
 * an expo curve, firing its own warp as it arrives.
 */
export function runHeroIntro(root: HTMLElement | null) {
  if (!root) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(root.querySelectorAll(".letter"), { opacity: 1, x: 0, y: 0 });
    return;
  }

  const media = root.querySelector<HTMLElement>(".header-media");
  if (media) {
    gsap.fromTo(
      media,
      { scale: 1.08, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.8, ease: "expo.out" },
    );
  }

  const letters = Array.from(root.querySelectorAll<HTMLElement>(".letter"));
  letters.forEach((letter, index) => {
    const offset = OFFSETS[index % OFFSETS.length];
    gsap.set(letter, { ...offset, opacity: 0 });
  });

  const subtitle = Array.from(
    root.querySelectorAll<HTMLElement>(".header-subtitle span"),
  );

  letters.forEach((letter, index) => {
    gsap.to(letter, {
      x: 0,
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: "expo.out",
      delay: 0.35 + index * 0.055,
      onStart: () => playNoise(letter),
    });
  });

  subtitle.forEach((node, index) => {
    gsap.fromTo(
      node,
      { opacity: 0, x: index % 2 === 0 ? -40 : 40 },
      {
        opacity: 1,
        x: 0,
        duration: 1.4,
        ease: "expo.out",
        delay: 0.9 + index * 0.1,
      },
    );
  });
}

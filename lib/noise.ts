"use client";

import gsap from "gsap";

/**
 * "Melting type" rig — a clean-room port of the reference's two-pass filter.
 *
 * Every registered letter gets two generated SVG filters (the goo/displacement
 * carve and the tv warp) driven from one shared rAF loop. Only the loop rate is
 * ours: 24fps instead of 60, which is invisible at this blur radius.
 */

type Options = {
  min?: number;
  max?: number;
};

type Instance = {
  el: HTMLElement;
  id: string;
  min: number;
  max: number;
  ease: number;
  rest: number;
  inView: boolean;
  canPlay: boolean;
  settled: boolean;
  data: { current: number };
  hover: { c: number; t: number };
  blur: SVGFEGaussianBlurElement;
  turb: SVGFETurbulenceElement;
  disp: SVGFEDisplacementMapElement;
  tv: SVGFEDisplacementMapElement;
};

const instances = new Set<Instance>();
const byElement = new WeakMap<HTMLElement, Instance>();

let observer: IntersectionObserver | null = null;
let raf = 0;
let running = false;
let lastFrame = 0;

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function filtersRoot() {
  const svg = document.getElementById("filters");
  if (!svg) return null;
  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.appendChild(defs);
  }
  return defs;
}

function attach(instance: Instance) {
  // two chained passes, exactly like the reference: the goo/displacement
  // filter carves the glyph, the tv filter boils the edge at rest.
  instance.el.style.filter = `url(#${instance.id}) url(#${instance.id}-tv)`;
}

function detach(instance: Instance) {
  instance.el.style.filter = "";
}

function ensureObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const instance = byElement.get(entry.target as HTMLElement);
        if (!instance) continue;
        instance.inView = entry.isIntersecting;
        if (instance.inView) {
          attach(instance);
          // first time on screen: melt back into place
          if (!instance.settled) {
            instance.settled = true;
            playNoise(instance.el, Math.random() * 0.25);
          }
        } else {
          detach(instance);
        }
      }
      pump();
    },
    { threshold: 0 },
  );
  return observer;
}

function fbm(t: number) {
  let value = 0;
  let amplitude = 0.5;
  for (let i = 0; i < 4; i++) {
    value += amplitude * Math.sin(t);
    t *= 2;
    amplitude *= 0.5;
  }
  return value;
}

const map = (v: number, a: number, b: number, c: number, d: number) =>
  c + (d - c) * ((v - a) / (b - a));

function frame(now: number) {
  if (!running) return;

  if (now - lastFrame >= 1000 / 24) {
    lastFrame = now;
    const t = now * 0.01;

    for (const instance of instances) {
      if (!instance.inView || !instance.canPlay) continue;

      const { hover, data } = instance;
      hover.c += (hover.t - hover.c) * 0.07;
      instance.rest = fbm(t * (1 - instance.ease)) * (1 + hover.c * 0.5);

      const from = instance.min + 0.5 * hover.c;
      const to = instance.max + 0.1 * hover.c;
      const freqX = map(data.current, to, from, 0, 0.01);
      const freqY = map(data.current, to, from, 0.9, 1);

      instance.blur.setAttribute(
        "stdDeviation",
        (
          data.current * 0.1 +
          instance.ease * data.current * 0.01 +
          hover.c * 0.1
        ).toFixed(3),
      );
      instance.turb.setAttribute(
        "baseFrequency",
        `${freqX.toFixed(4)} ${freqY.toFixed(3)}`,
      );
      instance.disp.setAttribute(
        "scale",
        (data.current * 1.5 + instance.rest * 60 * from).toFixed(2),
      );
      instance.tv.setAttribute(
        "scale",
        (data.current * 0.5 + instance.rest * 60 * from).toFixed(2),
      );
    }
  }

  raf = requestAnimationFrame(frame);
}

function pump() {
  let anyVisible = false;
  for (const instance of instances) {
    if (instance.inView && instance.canPlay) {
      anyVisible = true;
      break;
    }
  }

  if (anyVisible && !running) {
    running = true;
    lastFrame = 0;
    raf = requestAnimationFrame(frame);
  } else if (!anyVisible && running) {
    running = false;
    cancelAnimationFrame(raf);
  }
}

/** Registers one letter. Returns the cleanup for React ref callbacks. */
export function registerNoise(el: HTMLElement, options: Options = {}) {
  if (prefersReducedMotion()) return () => {};

  const defs = filtersRoot();
  if (!defs) return () => {};

  const id = `noise-${Math.random().toString(36).slice(2, 10)}`;
  const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  filter.setAttribute("id", id);
  filter.innerHTML = `
    <feGaussianBlur in="SourceGraphic" stdDeviation="0" result="blur"></feGaussianBlur>
    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo"></feColorMatrix>
    <feTurbulence type="fractalNoise" baseFrequency="0.01 1" numOctaves="1" seed="1" result="noise"></feTurbulence>
    <feDisplacementMap in="goo" in2="noise" scale="0" result="displacement"></feDisplacementMap>
    <feComposite in="SourceGraphic" in2="displacement" operator="atop"></feComposite>`;

  const tv = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  tv.setAttribute("id", `${id}-tv`);
  tv.innerHTML = `
    <feTurbulence type="fractalNoise" baseFrequency="1" numOctaves="5" result="warp"></feTurbulence>
    <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="50" in="SourceGraphic" in2="warp"></feDisplacementMap>`;

  defs.appendChild(filter);
  defs.appendChild(tv);

  const instance: Instance = {
    el,
    id,
    min: options.min ?? 0,
    max: (options.max ?? 30) + Math.random() * 10,
    ease: Math.random(),
    rest: 0,
    inView: false,
    canPlay: true,
    settled: false,
    data: { current: 40 },
    hover: { c: 0, t: 0 },
    blur: filter.querySelector("feGaussianBlur") as SVGFEGaussianBlurElement,
    turb: filter.querySelector("feTurbulence") as SVGFETurbulenceElement,
    disp: filter.querySelector("feDisplacementMap") as SVGFEDisplacementMapElement,
    tv: tv.querySelector("feDisplacementMap") as SVGFEDisplacementMapElement,
  };

  instance.data.current = instance.max;

  instances.add(instance);
  byElement.set(el, instance);
  ensureObserver().observe(el);

  return () => {
    observer?.unobserve(el);
    instances.delete(instance);
    byElement.delete(el);
    filter.remove();
    tv.remove();
    detach(instance);
    pump();
  };
}

/** Snap-return the warp, used when a letter lands or is revealed. */
export function playNoise(el: HTMLElement | null, delay = 0) {
  if (!el) return;
  const instance = byElement.get(el);
  if (!instance) return;
  gsap.fromTo(
    instance.data,
    { current: instance.max },
    { current: instance.min, duration: 2, ease: "power4.out", delay },
  );
}

export function playNoiseIn(el: HTMLElement | null, delay = 0) {
  if (!el) return;
  const nodes = el.querySelectorAll<HTMLElement>(".letter");
  nodes.forEach((node, i) => playNoise(node, delay + i * 0.15));
}

export function setNoisePlaying(parent: Element | null, playing: boolean) {
  if (!parent) return;
  for (const node of parent.querySelectorAll<HTMLElement>(".letter")) {
    const instance = byElement.get(node);
    if (instance) instance.canPlay = playing;
  }
  pump();
}

export function introspectNoise() {
  return { count: instances.size, running };
}

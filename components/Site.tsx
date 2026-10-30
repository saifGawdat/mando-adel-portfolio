"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";

import About from "./About";
import Contact from "./Contact";
import Footer from "./Footer";
import Hero from "./Hero";
import MobileNav from "./MobileNav";
import MoreWork from "./MoreWork";
import Nav from "./Nav";
import Preloader from "./Preloader";
import WorkSection from "./WorkSection";

import type { SiteContent } from "@/content/site";
import { runHeroIntro } from "@/lib/intro";
import { playNoiseIn, prefersReducedMotion, setNoisePlaying } from "@/lib/noise";
import { enterFromFor, enterWork, resetWork } from "@/lib/workEnter";
import { enterAbout, resetAbout } from "@/lib/aboutEnter";

const isMobile = () =>
  typeof window !== "undefined" && window.innerWidth <= 1024;

export default function Site({ site }: { site: SiteContent }) {
  const [ready, setReady] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const lenisRef = useRef<Lenis | null>(null);
  const contactOpenRef = useRef(false);

  const handlePreloaderDone = useCallback(() => setReady(true), []);

  /* ---------------------------------------------------------------- scroll */
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const reduced = prefersReducedMotion();

    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      smoothWheel: !reduced,
    });
    lenisRef.current = lenis;

    const blur = document.querySelector<SVGFEGaussianBlurElement>(
      "#motion-blur-header feGaussianBlur",
    );
    const heroImage = document.querySelector<HTMLImageElement>(".header-image");
    const parallax = Array.from(
      document.querySelectorAll<HTMLElement>("[data-speed]"),
    );

    let pending = false;

    const apply = (scroll: number) => {
      if (!isMobile()) {
        const raw = Math.min(Math.max(scroll / window.innerHeight, 0), 1);
        // inOutQuad, same curve as the reference
        const eased = raw < 0.5 ? 2 * raw * raw : -1 + (4 - 2 * raw) * raw;

        blur?.setAttribute("stdDeviation", `${50 * eased} 0`);
        if (heroImage) {
          heroImage.style.filter = `url(#motion-blur-header) brightness(${
            0.99 - 0.5 * raw
          }) contrast(${1.01 + 0.1 * raw})`;
        }

        for (const el of parallax) {
          const parent = el.parentElement;
          if (!parent) continue;
          const speed = Number(el.dataset.speed || 0) * 0.5;
          const rect = parent.getBoundingClientRect();
          let progress =
            1 - (rect.top + rect.height) / (window.innerHeight + rect.height);
          progress = Math.min(1, Math.max(0, progress));
          const y = speed - 2 * speed * progress;
          el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        }
      }
    };

    const onScroll = (instance: Lenis) => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        apply(instance.scroll ?? window.scrollY);
      });
    };

    lenis.on("scroll", onScroll);
    apply(window.scrollY);

    const onResize = () => apply(lenis.scroll);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  /* --------------------------------------------------------------- reveals */
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-section]"),
    );

    if (prefersReducedMotion()) {
      nodes.forEach((node) => node.classList.add("is-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  /* ---------------------------------------------------------------- intro */
  useEffect(() => {
    if (!ready) return;
    const html = document.documentElement;
    html.dataset.intro = "done";
    lenisRef.current?.start();
    runHeroIntro(document.getElementById("header"));
  }, [ready]);

  /* ------------------------------------------------------------ dev grid */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key.toLowerCase() === "g") {
        document.documentElement.classList.toggle("show-grid");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------------------------------------------------------- mobile pager */
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-step-section]"),
    );
    if (!sections.length) return;

    // on phones/tablets a section may collapse to fewer steps
    // (e.g. work sections skip their title-only screen)
    const stepsOf = (section: HTMLElement) =>
      isMobile() && section.dataset.mobileSteps
        ? Number(section.dataset.mobileSteps)
        : Number(section.dataset.steps || 1);

    let total = 0;
    const measure = () => {
      let virtual = 0;
      for (const section of sections) {
        section.dataset.virtualIndex = String(virtual);
        virtual += stepsOf(section);
      }
      total = virtual;
    };
    measure();

    const bar = document.querySelector<HTMLElement>("#nav-mobile-bar span");
    const indexEl = document.getElementById("nav-mobile-index");
    const titleEl = document.getElementById("nav-mobile-title");

    let index = 0;

    // phones/tablets: work sections play their entrance when they become active
    const works = sections.filter((section) =>
      section.classList.contains("work"),
    );
    let current: HTMLElement | null = null;
    const aboutSection = sections.find((section) => section.id === "about");

    const apply = () => {
      for (const section of sections) {
        const steps = stepsOf(section);
        const start = Number(section.dataset.virtualIndex);
        const active = index >= start && index < start + steps;
        section.classList.toggle("is-active", active);
        if (active) section.dataset.currentStep = String(index - start);
        if (isMobile()) section.setAttribute("aria-hidden", String(!active));
        else section.removeAttribute("aria-hidden");
      }

      const active = sections.find((section) =>
        section.classList.contains("is-active"),
      );

      if (active !== current) {
        current = active ?? null;
        if (active && isMobile()) {
          if (works.includes(active)) {
            enterWork(active, enterFromFor(works.indexOf(active)));
          } else if (active === aboutSection) {
            enterAbout(active);
          }
        }
      }

      if (bar) {
        bar.style.transform = `scaleX(${total > 1 ? index / (total - 1) : 0})`;
      }
      if (indexEl) indexEl.textContent = String(index + 1).padStart(2, "0");
      if (titleEl && active) titleEl.textContent = active.dataset.label ?? "";
    };

    const go = (next: number) => {
      index = Math.min(Math.max(next, 0), total - 1);
      apply();
    };

    const insideChrome = (target: EventTarget | null) =>
      target instanceof Element &&
      Boolean(target.closest("#nav, #nav-mobile, #contact, #nav-mobile-bottom"));

    let touchStart = 0;
    const onTouchStart = (event: TouchEvent) => {
      if (insideChrome(event.target) || contactOpenRef.current) return;
      touchStart = event.touches[0]?.clientY ?? 0;
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (!isMobile() || insideChrome(event.target) || contactOpenRef.current) return;
      const end = event.changedTouches[0]?.clientY ?? touchStart;
      const delta = touchStart - end;
      if (Math.abs(delta) < 42) return;
      go(index + (delta > 0 ? 1 : -1));
    };

    let wheelLock = 0;
    const onWheel = (event: WheelEvent) => {
      if (!isMobile() || contactOpenRef.current) return;
      const now = Date.now();
      if (now - wheelLock < 650 || Math.abs(event.deltaY) < 6) return;
      wheelLock = now;
      go(index + (event.deltaY > 0 ? 1 : -1));
    };

    const prev = document.getElementById("nav-prev");
    const next = document.getElementById("nav-next");
    const onPrev = () => go(index - 1);
    const onNext = () => go(index + 1);

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    prev?.addEventListener("click", onPrev);
    next?.addEventListener("click", onNext);

    const onResize = () => {
      measure();
      index = Math.min(index, total - 1);
      if (!isMobile()) {
        works.forEach(resetWork);
        if (aboutSection) resetAbout(aboutSection);
      }
      apply();
    };
    window.addEventListener("resize", onResize);

    apply();

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      prev?.removeEventListener("click", onPrev);
      next?.removeEventListener("click", onNext);
    };
  }, []);

  /* --------------------------------------------------------------- contact */
  useEffect(() => {
    contactOpenRef.current = contactOpen;
    const html = document.documentElement;
    html.classList.toggle("contact-open", contactOpen);

    const lenis = lenisRef.current;
    if (contactOpen) {
      lenis?.stop();
      const mail = document.getElementById("contact-mail");
      if (mail) setNoisePlaying(mail, true);
      playNoiseIn(mail, 0.1);
    } else {
      lenis?.start();
      const mail = document.getElementById("contact-mail");
      if (mail) setNoisePlaying(mail, false);
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setContactOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [contactOpen]);

  const openContact = useCallback(() => setContactOpen(true), []);
  const closeContact = useCallback(() => setContactOpen(false), []);

  return (
    <>
      <Preloader onDone={handlePreloaderDone} />

      <div id="page">
        <Nav site={site} onContact={openContact} />

        <main id="main">
          <Hero site={site} />
          <About site={site} />
          {site.works.map((work, index) => (
            <WorkSection
              key={work.slug}
              work={work}
              anchor={index === 0 ? "work" : work.slug}
            />
          ))}
          <MoreWork site={site} />
        </main>

        <Footer site={site} />
      </div>

      <Contact
        site={site}
        open={contactOpen}
        onClose={closeContact}
      />

      <MobileNav />

      <div id="noise" aria-hidden="true" />
      <div id="grid" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} />
        ))}
      </div>
    </>
  );
}

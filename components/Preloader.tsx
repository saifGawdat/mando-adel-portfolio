"use client";

import { useEffect, useState } from "react";

/**
 * Black curtain with the wordmark and a hairline progress track. Counts while
 * the hero decodes, then clips away so the hero entrance can run underneath.
 */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const started = performance.now();
    let frame = 0;
    let finished = false;

    const tick = (now: number) => {
      const progress = Math.min((now - started) / 1400, 1);
      setCount(Math.round(progress * 100));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const finish = () => {
      if (finished) return;
      finished = true;
      setCount(100);
      setLeaving(true);
      // the hero entrance runs underneath the lifting curtain
      onDone();
    };

    const wait = Math.max(0, 1600 - (performance.now() - started));
    const onLoad = () => window.setTimeout(finish, wait);

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    // never trap the visitor behind a slow asset
    const safety = window.setTimeout(finish, 5000);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", onLoad);
      window.clearTimeout(safety);
    };
  }, [onDone]);

  return (
    <div
      id="preloader"
      className={leaving ? "is-leaving" : ""}
      aria-hidden="true"
    >
      <div className="preloader-top">
        <span>Portfolio</span>
        <span>2016 — 2026</span>
      </div>

      <div className="preloader-center">
        <span className="h1">MANDO ADEL</span>
      </div>

      <div className="preloader-bottom">
        <div className="preloader-track">
          <span style={{ transform: `scaleX(${count / 100})` }} />
        </div>
        <span className="preloader-count">
          {String(count).padStart(3, "0")}
        </span>
      </div>
    </div>
  );
}

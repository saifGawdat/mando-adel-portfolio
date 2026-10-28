"use client";

import { memo } from "react";

import { registerNoise } from "@/lib/noise";

/**
 * Letter spans without the word wrapper, so a caller can own the grouping
 * (`.group` in the hero wordmark, `.line` in section titles).
 *
 * Memoised: a parent re-render (opening the contact sheet, toggling copied)
 * must not replace the ref callbacks, or every registered letter melts again.
 */
function Letters({
  text,
  noise = true,
  min,
  mins,
}: {
  text: string;
  noise?: boolean;
  min?: number;
  /** per-letter resting erosion, positionally; missing entries rest at 0 */
  mins?: number[];
}) {
  // The reference authors a `data-min` on every letter (0.01–0.2). Without an
  // authored value we derive a stable one from the glyph, so section titles
  // keep the same chewed edges on every render.
  const resting = (char: string, index: number) => {
    if (mins) return mins[index] ?? 0;
    if (min !== undefined) return min;
    return 0.01 + ((char.charCodeAt(0) * 37 + index * 53) % 19) / 100;
  };

  return (
    <>
      {Array.from(text).map((char, index) => (
        <span
          className="letter"
          aria-hidden="true"
          key={`${char}-${index}`}
          ref={
            noise
              ? (node) => {
                  if (!node) return;
                  return registerNoise(node, { min: resting(char, index) });
                }
              : undefined
          }
        >
          <span className="letter-container">
            <span className="letter-content">{char}</span>
          </span>
        </span>
      ))}
    </>
  );
}

export default memo(Letters);

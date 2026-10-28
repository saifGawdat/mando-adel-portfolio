"use client";

import type { ElementType, HTMLAttributes } from "react";
import { registerNoise } from "@/lib/noise";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  noise?: boolean;
  min?: number;
} & Omit<HTMLAttributes<HTMLElement>, "children">;

/**
 * Splits a string into word groups and letter spans, mirroring the reference
 * markup (.group > .letter > .letter-container > .letter-content) so CSS can
 * clip, offset and warp individual characters.
 */
export default function NoiseText({
  text,
  as: Tag = "span",
  className,
  noise = true,
  min,
  ...rest
}: Props) {
  const words = text.split(" ").filter((word) => word.length > 0);
  const classes = ["noise-text", className].filter(Boolean).join(" ");

  return (
    <Tag className={classes} aria-label={text} {...rest}>
      {words.map((word, wordIndex) => (
        <span className="group" aria-hidden="true" key={`${word}-${wordIndex}`}>
          {Array.from(word).map((char, charIndex) => (
            <span
              className="letter"
              key={`${char}-${charIndex}`}
              ref={
                noise
                  ? (node) => {
                      if (!node) return;
                      return registerNoise(node, { min });
                    }
                  : undefined
              }
            >
              <span className="letter-container">
                <span className="letter-content">{char}</span>
              </span>
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}

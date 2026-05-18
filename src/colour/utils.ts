import type { Hsl } from "./types";

const HEX_PATTERN = /^[0-9A-F]{6}$/;

/**
 * Strip a leading `#`, uppercase the input, and validate that it's a
 * 6-character hex string. Throws on invalid input.
 *
 * Three-character shorthand (e.g. "FFF") is intentionally not supported —
 * the palette generator always produces full 6-character hex, so accepting
 * shorthand would only add ambiguity for very little benefit.
 */
export function normaliseHex(input: string): string {
  const stripped = input.startsWith("#") ? input.slice(1) : input;
  const upper = stripped.toUpperCase();
  if (!HEX_PATTERN.test(upper)) {
    throw new Error(`Invalid hex colour: "${input}"`);
  }
  return upper;
}

/**
 * Returns true if the input is a valid 6-character hex string,
 * optionally with a leading `#`. Case-insensitive.
 */
export function isValidHex(input: string): boolean {
  const stripped = input.startsWith("#") ? input.slice(1) : input;
  return HEX_PATTERN.test(stripped.toUpperCase());
}

/**
 * Convert a hex colour string to HSL.
 *
 * Returns rounded integer values: hue 0-360, saturation 0-100, lightness
 * 0-100. For achromatic colours (black, white, any grey) the returned hue
 * is 0 — there is no meaningful hue when saturation is 0.
 *
 * Accepts hex with or without a leading `#`, in any case.
 */
export function hexToHsl(input: string): Hsl {
  const hex = normaliseHex(input);
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lNorm = (max + min) / 2;

  let hNorm = 0;
  let sNorm = 0;

  if (max !== min) {
    const delta = max - min;
    sNorm = lNorm > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case r:
        hNorm = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        hNorm = ((b - r) / delta + 2) / 6;
        break;
      case b:
        hNorm = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(hNorm * 360),
    s: Math.round(sNorm * 100),
    l: Math.round(lNorm * 100),
  };
}

/**
 * Convert HSL to a 6-character uppercase hex string (no leading `#`).
 *
 * Defensive normalisation: hue wraps modulo 360 (so 370 → 10, -10 → 350);
 * saturation and lightness are clamped to 0-100. This means callers can
 * pass results of hue arithmetic without worrying about overflow.
 */
export function hslToHex({ h, s, l }: Hsl): string {
  const hNorm = (((h % 360) + 360) % 360) / 360;
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;

  let r: number;
  let g: number;
  let b: number;

  if (sNorm === 0) {
    r = g = b = lNorm;
  } else {
    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;
    r = hueToRgb(p, q, hNorm + 1 / 3);
    g = hueToRgb(p, q, hNorm);
    b = hueToRgb(p, q, hNorm - 1 / 3);
  }

  return `${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

/**
 * Internal helper for hslToHex — converts a hue position to a normalised
 * RGB channel value. The formula is the standard one from the HSL-to-RGB
 * conversion (see MDN / Wikipedia).
 */
function hueToRgb(p: number, q: number, t: number): number {
  let tNorm = t;
  if (tNorm < 0) tNorm += 1;
  if (tNorm > 1) tNorm -= 1;
  if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
  if (tNorm < 1 / 2) return q;
  if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
  return p;
}

/**
 * Internal helper — clamp a 0-1 channel value, scale to 0-255, and format
 * as a 2-character uppercase hex byte.
 */
function toHexByte(channel: number): string {
  const clamped = Math.round(Math.max(0, Math.min(1, channel)) * 255);
  return clamped.toString(16).padStart(2, "0").toUpperCase();
}

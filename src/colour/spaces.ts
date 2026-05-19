import {
  parse,
  formatHex as culoriFormatHex,
  formatCss,
  rgb,
  hsl,
  hwb,
  oklab,
  oklch,
  p3,
  type Color,
} from "culori";
import type { ColourSpace } from "./export";
import { normaliseHex } from "./utils";

function parseProjectHex(hex: string): Color {
  const norm = normaliseHex(hex);
  const parsed = parse(`#${norm}`);
  if (!parsed) throw new Error(`culori failed to parse #${norm}`);
  return parsed;
}

/** `#FF6842` — uppercase, with leading `#`. */
export function formatHex(hex: string): string {
  return culoriFormatHex(parseProjectHex(hex)).toUpperCase();
}

/** `rgb(255 104 66)`. */
export function formatRgb(hex: string): string {
  return formatCss(rgb(parseProjectHex(hex)));
}

/** `hsl(15 100% 63%)`. */
export function formatHsl(hex: string): string {
  return formatCss(hsl(parseProjectHex(hex)));
}

/** `hwb(15 25.88% 0%)`. */
export function formatHwb(hex: string): string {
  return formatCss(hwb(parseProjectHex(hex)));
}

/** `oklab(0.701 0.158 0.111)`. */
export function formatOklab(hex: string): string {
  return formatCss(oklab(parseProjectHex(hex)));
}

/** `oklch(0.701 0.193 35.04)`. */
export function formatOklch(hex: string): string {
  return formatCss(oklch(parseProjectHex(hex)));
}

/** `color(display-p3 0.929 0.443 0.304)`. */
export function formatDisplayP3(hex: string): string {
  return formatCss(p3(parseProjectHex(hex)));
}

/**
 * Format a hex colour using the chosen colour space. Used by the
 * export panel to convert each palette entry before serialising.
 *
 * Exhaustive switch: TypeScript will flag a missing case if a new
 * ColourSpace is added.
 */
export function formatColour(hex: string, space: ColourSpace): string {
  switch (space) {
    case "hex":
      return formatHex(hex);
    case "rgb":
      return formatRgb(hex);
    case "hsl":
      return formatHsl(hex);
    case "hwb":
      return formatHwb(hex);
    case "oklab":
      return formatOklab(hex);
    case "oklch":
      return formatOklch(hex);
    case "display-p3":
      return formatDisplayP3(hex);
  }
}

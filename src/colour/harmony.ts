import type { Colour, Hsl } from "./types";
import { hslToHex } from "./utils";

/**
 * A recipe describes a palette: each entry is one slot, with a hue offset
 * relative to the palette's base hue, plus the saturation and lightness
 * for that slot.
 */
export type HarmonyRecipe = ReadonlyArray<{
  hueOffset: number;
  saturation: number;
  lightness: number;
}>;

/**
 * Split-complementary recipe.
 *
 * - Three vivid slots at the base hue and the two split-complementary
 *   positions (base + 150°, base + 210°).
 * - Two muted echoes — one of the base hue, one of the first split-comp —
 *   with sharply reduced saturation and lightness. The second split-comp
 *   intentionally has no muted variant, which keeps the palette from
 *   feeling too symmetrical.
 */
export const SPLIT_COMPLEMENTARY: HarmonyRecipe = [
  { hueOffset: 0, saturation: 100, lightness: 63 },
  { hueOffset: 150, saturation: 100, lightness: 63 },
  { hueOffset: 210, saturation: 100, lightness: 63 },
  { hueOffset: 0, saturation: 15, lightness: 44 },
  { hueOffset: 150, saturation: 15, lightness: 44 },
];

/**
 * Generate a 5-colour palette from a recipe.
 *
 * If `baseHue` is omitted, a random integer hue (0-359) is chosen. If
 * provided, the function is deterministic — same input, same output.
 *
 * Every entry returns with `name: ""`.
 */
export function generatePalette(
  recipe: HarmonyRecipe,
  baseHue?: number,
): Colour[] {
  const base = baseHue ?? Math.floor(Math.random() * 360);
  return recipe.map(({ hueOffset, saturation, lightness }) => {
    const hsl: Hsl = {
      h: base + hueOffset,
      s: saturation,
      l: lightness,
    };
    return {
      hex: hslToHex(hsl),
      name: "",
      locked: false,
    };
  });
}

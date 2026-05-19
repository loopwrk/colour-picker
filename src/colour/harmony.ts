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
 * Complementary recipe — base hue and its opposite (base + 180°).
 *
 * With only two hues to work with, slots 0/1 carry the vivid pairing;
 * slots 2/3 are softer tints of those same hues; slot 4 is a muted
 * neutral grounded in the base hue.
 */
export const COMPLEMENTARY: HarmonyRecipe = [
  { hueOffset: 0, saturation: 100, lightness: 63 },
  { hueOffset: 180, saturation: 100, lightness: 63 },
  { hueOffset: 0, saturation: 60, lightness: 80 },
  { hueOffset: 180, saturation: 60, lightness: 80 },
  { hueOffset: 0, saturation: 15, lightness: 44 },
];

export const TRIAD: HarmonyRecipe = [
  { hueOffset: 0, saturation: 100, lightness: 63 },
  { hueOffset: 120, saturation: 100, lightness: 63 },
  { hueOffset: 240, saturation: 100, lightness: 63 },
  { hueOffset: 0, saturation: 15, lightness: 44 },
  { hueOffset: 120, saturation: 15, lightness: 44 },
];

/**
 * Square (tetradic) recipe — four hues evenly spaced at 90° intervals,
 * plus a muted neutral at the base hue to balance the four vivid slots.
 */
export const SQUARE: HarmonyRecipe = [
  { hueOffset: 0, saturation: 100, lightness: 63 },
  { hueOffset: 90, saturation: 100, lightness: 63 },
  { hueOffset: 180, saturation: 100, lightness: 63 },
  { hueOffset: 270, saturation: 100, lightness: 63 },
  { hueOffset: 0, saturation: 15, lightness: 44 },
];

/**
 * Monochromatic recipe — five tints/tones/shades of the base hue.
 *
 * Saturation and lightness both vary: the lightest slots are pale and
 * less saturated, the darkest is rich and deep. This gives the palette
 * a sense of depth without introducing a second hue.
 */
export const MONOCHROMATIC: HarmonyRecipe = [
  { hueOffset: 0, saturation: 55, lightness: 88 },
  { hueOffset: 0, saturation: 70, lightness: 72 },
  { hueOffset: 0, saturation: 85, lightness: 55 },
  { hueOffset: 0, saturation: 80, lightness: 38 },
  { hueOffset: 0, saturation: 70, lightness: 22 },
];

/**
 * Shades recipe — five steps along the lightness axis of a single hue,
 * with saturation held constant. Slot 0 is the lightest, slot 4 the
 * darkest (strict monotonic descent).
 */
export const SHADES: HarmonyRecipe = [
  { hueOffset: 0, saturation: 80, lightness: 88 },
  { hueOffset: 0, saturation: 80, lightness: 68 },
  { hueOffset: 0, saturation: 80, lightness: 50 },
  { hueOffset: 0, saturation: 80, lightness: 32 },
  { hueOffset: 0, saturation: 80, lightness: 16 },
];

/**
 * The set of harmony modes the app supports. Adding a new mode means
 * adding it here, exporting a recipe constant, and adding an entry to
 * RECIPES below — the UI selector reads from HARMONY_MODES.
 */
export const HARMONY_MODES = [
  "split-complementary",
  "complementary",
  "triad",
  "square",
  "monochromatic",
  "shades",
] as const;

export type HarmonyMode = (typeof HARMONY_MODES)[number];

/**
 * Lookup from mode name to recipe. Used by the UI layer so it can pass
 * just a string around (in state, in URL params, etc.) rather than
 * carrying the recipe object directly.
 */
export const RECIPES: Record<HarmonyMode, HarmonyRecipe> = {
  "split-complementary": SPLIT_COMPLEMENTARY,
  complementary: COMPLEMENTARY,
  triad: TRIAD,
  square: SQUARE,
  monochromatic: MONOCHROMATIC,
  shades: SHADES,
};

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

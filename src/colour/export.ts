export const COLOUR_SPACES = [
  "oklch",
  "oklab",
  "hex",
  "rgb",
  "hsl",
  "hwb",
  "display-p3",
] as const;

export type ColourSpace = (typeof COLOUR_SPACES)[number];

export const OUTPUT_FORMATS = [
  "css-variables",
  "design-tokens",
  "tailwind",
  "json",
  "array",
] as const;

export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

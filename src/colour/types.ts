export interface Colour {
  hex: string; // canonical representation, no leading '#', uppercase, e.g. "1E5F93"
  name: string;
  locked: boolean;
}

export interface Hsl {
  h: number;
  s: number;
  l: number;
}

export interface NamedColour {
  hex: string; // canonical uppercase, no leading '#'
  name: string; // from API, or the hex itself on failure
  bestContrast: "white" | "black"; // safe default "black"
}

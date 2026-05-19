import {
  COMPLEMENTARY,
  HARMONY_MODES,
  MONOCHROMATIC,
  RECIPES,
  SHADES,
  SPLIT_COMPLEMENTARY,
  SQUARE,
  TRIAD,
  generatePalette,
  type HarmonyMode,
} from "./harmony";
import { hexToHsl, isValidHex } from "./utils";

describe("SPLIT_COMPLEMENTARY recipe", () => {
  it("has 5 slots", () => {
    expect(SPLIT_COMPLEMENTARY).toHaveLength(5);
  });
});

describe("generatePalette", () => {
  describe("structural properties", () => {
    const palette = generatePalette(SPLIT_COMPLEMENTARY, 200);

    it("returns 5 colours", () => {
      expect(palette).toHaveLength(5);
    });

    it("every entry has a valid hex", () => {
      for (const c of palette) {
        expect(isValidHex(c.hex)).toBe(true);
      }
    });

    it("every entry starts with an empty name", () => {
      for (const c of palette) {
        expect(c.name).toBe("");
      }
    });

    it("every entry starts unlocked", () => {
      for (const c of palette) {
        expect(c.locked).toBe(false);
      }
    });
  });

  describe("hue distribution (baseHue = 151)", () => {
    const palette = generatePalette(SPLIT_COMPLEMENTARY, 151);

    it.each<[number, number]>([
      [0, 151], // base
      [1, 151 + 150], // split-comp 1
      [2, 151 + 210], // split-comp 2 (wraps to 1°)
      [3, 151], // muted base
      [4, 151 + 150], // muted split-comp 1
    ])("slot %d has hue ≈ %d°", (idx, expectedHue) => {
      expectHueCloseTo(hexToHsl(palette[idx].hex).h, expectedHue);
    });
  });

  describe("saturation and lightness (baseHue = 151)", () => {
    const palette = generatePalette(SPLIT_COMPLEMENTARY, 151);

    it.each<[number, number, number]>([
      [0, 100, 63],
      [1, 100, 63],
      [2, 100, 63],
      [3, 15, 44],
      [4, 15, 44],
    ])("slot %d has saturation ≈ %d and lightness ≈ %d", (idx, expS, expL) => {
      const { s, l } = hexToHsl(palette[idx].hex);
      expect(Math.abs(s - expS)).toBeLessThanOrEqual(2);
      expect(Math.abs(l - expL)).toBeLessThanOrEqual(2);
    });
  });

  describe("exact output (baseHue = 151)", () => {
    it("produces the documented hex values", () => {
      const palette = generatePalette(SPLIT_COMPLEMENTARY, 151);
      expect(palette.map((c) => c.hex)).toEqual([
        "42FFA4", // base, vivid
        "FF42FC", // split-comp 1, vivid
        "FF4542", // split-comp 2, vivid
        "5F8171", // base, muted
        "815F80", // split-comp 1, muted
      ]);
    });
  });

  describe("randomness (no baseHue supplied)", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("uses Math.random to pick a hue when baseHue is omitted", () => {
      // floor(0.5 * 360) = 180, so this should match an explicit baseHue=180.
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const random = generatePalette(SPLIT_COMPLEMENTARY);
      const explicit = generatePalette(SPLIT_COMPLEMENTARY, 180);
      expect(random.map((c) => c.hex)).toEqual(explicit.map((c) => c.hex));
    });

    it("produces different palettes for different random values", () => {
      const spy = vi.spyOn(Math, "random");
      spy.mockReturnValueOnce(0.0); // base hue 0
      const a = generatePalette(SPLIT_COMPLEMENTARY);
      spy.mockReturnValueOnce(0.5); // base hue 180
      const b = generatePalette(SPLIT_COMPLEMENTARY);
      expect(a[0].hex).not.toBe(b[0].hex);
    });
  });
});

describe("additional harmony recipes", () => {
  it.each<[string, typeof SPLIT_COMPLEMENTARY]>([
    ["COMPLEMENTARY", COMPLEMENTARY],
    ["TRIAD", TRIAD],
    ["SQUARE", SQUARE],
    ["MONOCHROMATIC", MONOCHROMATIC],
    ["SHADES", SHADES],
  ])("%s has 5 slots", (_, recipe) => {
    expect(recipe).toHaveLength(5);
  });
  it.each<[string, typeof SPLIT_COMPLEMENTARY]>([
    ["COMPLEMENTARY", COMPLEMENTARY],
    ["TRIAD", TRIAD],
    ["SQUARE", SQUARE],
    ["MONOCHROMATIC", MONOCHROMATIC],
    ["SHADES", SHADES],
  ])("%s generates 5 valid hex colours", (_, recipe) => {
    const palette = generatePalette(recipe, 200);
    expect(palette).toHaveLength(5);
    for (const c of palette) {
      expect(isValidHex(c.hex)).toBe(true);
    }
  });
  it("COMPLEMENTARY places slots 0 and 1 at base and base + 180°", () => {
    const palette = generatePalette(COMPLEMENTARY, 50);
    expectHueCloseTo(hexToHsl(palette[0].hex).h, 50);
    expectHueCloseTo(hexToHsl(palette[1].hex).h, 50 + 180);
  });
  it("TRIAD places slots 0/1/2 at base, +120°, +240°", () => {
    const palette = generatePalette(TRIAD, 30);
    expectHueCloseTo(hexToHsl(palette[0].hex).h, 30);
    expectHueCloseTo(hexToHsl(palette[1].hex).h, 30 + 120);
    expectHueCloseTo(hexToHsl(palette[2].hex).h, 30 + 240);
  });
  it("SQUARE places slots 0–3 at base, +90°, +180°, +270°", () => {
    const palette = generatePalette(SQUARE, 100);
    expectHueCloseTo(hexToHsl(palette[0].hex).h, 100);
    expectHueCloseTo(hexToHsl(palette[1].hex).h, 100 + 90);
    expectHueCloseTo(hexToHsl(palette[2].hex).h, 100 + 180);
    expectHueCloseTo(hexToHsl(palette[3].hex).h, 100 + 270);
  });
  it("MONOCHROMATIC keeps every slot at the base hue", () => {
    const palette = generatePalette(MONOCHROMATIC, 200);
    for (const c of palette) {
      // Achromatic-near-edges may report h=0 from greyscale; tolerance high.
      const h = hexToHsl(c.hex).h;
      expectHueCloseTo(h, 200, 5);
    }
  });
  it("SHADES keeps every slot at the base hue and constant saturation", () => {
    const palette = generatePalette(SHADES, 200);
    for (const c of palette) {
      const { h, s } = hexToHsl(c.hex);
      expectHueCloseTo(h, 200, 5);
      expect(Math.abs(s - 80)).toBeLessThanOrEqual(2);
    }
  });
  it("SHADES has monotonically decreasing lightness across the 5 slots", () => {
    const palette = generatePalette(SHADES, 200);
    const lightnesses = palette.map((c) => hexToHsl(c.hex).l);
    for (let i = 1; i < lightnesses.length; i++) {
      expect(lightnesses[i]).toBeLessThan(lightnesses[i - 1]);
    }
  });
});

describe("RECIPES map and HARMONY_MODES list", () => {
  const expectedModes: HarmonyMode[] = [
    "split-complementary",
    "complementary",
    "triad",
    "square",
    "monochromatic",
    "shades",
  ];

  it("RECIPES has an entry for every HarmonyMode", () => {
    for (const mode of expectedModes) {
      expect(RECIPES[mode]).toBeDefined();
      expect(RECIPES[mode]).toHaveLength(5);
    }
  });

  it("HARMONY_MODES lists every mode exactly once", () => {
    expect([...HARMONY_MODES].sort()).toEqual([...expectedModes].sort());
    expect(HARMONY_MODES.length).toBe(new Set(HARMONY_MODES).size);
  });

  it("RECIPES['split-complementary'] is the SPLIT_COMPLEMENTARY constant", () => {
    // Same reference — the lookup is just a re-export, no copy.
    expect(RECIPES["split-complementary"]).toBe(SPLIT_COMPLEMENTARY);
  });
});

/**
 * Assert two hue values are within `tolerance` degrees of each other,
 * handling the 360° wrap-around (so 359° and 1° are 2° apart, not 358°).
 */
function expectHueCloseTo(
  actual: number,
  expected: number,
  tolerance = 2,
): void {
  const normalised = ((expected % 360) + 360) % 360;
  const rawDiff = Math.abs(actual - normalised);
  const diff = Math.min(rawDiff, 360 - rawDiff);
  expect(diff).toBeLessThanOrEqual(tolerance);
}

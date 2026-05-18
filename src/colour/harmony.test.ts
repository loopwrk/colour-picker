import { SPLIT_COMPLEMENTARY, generatePalette } from "./harmony";
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

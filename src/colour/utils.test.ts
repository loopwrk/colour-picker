import { hexToHsl, hslToHex, isValidHex, normaliseHex } from "./utils";
import type { Hsl } from "./types";

describe("normaliseHex", () => {
  it.each([
    ["1E5F93", "1E5F93"],
    ["#1E5F93", "1E5F93"],
    ["1e5f93", "1E5F93"],
    ["#1e5f93", "1E5F93"],
    ["FFFFFF", "FFFFFF"],
    ["000000", "000000"],
  ])("normalises %s -> %s", (input, expected) => {
    expect(normaliseHex(input)).toBe(expected);
  });

  it.each([
    [""],
    ["#"],
    ["F"],
    ["FFF"], // 3-char shorthand intentionally unsupported
    ["FFFFFFF"],
    ["GGGGGG"],
    ["12345Z"],
    ["#1E5F9"],
    ["not-a-hex"],
  ])("throws on invalid input: %s", (input) => {
    expect(() => normaliseHex(input)).toThrow(/Invalid hex colour/);
  });
});

describe("isValidHex", () => {
  it.each<[string, boolean]>([
    ["1E5F93", true],
    ["#1E5F93", true],
    ["1e5f93", true],
    ["#1e5f93", true],
    ["FFFFFF", true],
    ["000000", true],
    ["", false],
    ["#", false],
    ["F", false],
    ["FFF", false],
    ["FFFFFFF", false],
    ["GGGGGG", false],
    ["12345Z", false],
  ])("isValidHex(%s) === %s", (input, expected) => {
    expect(isValidHex(input)).toBe(expected);
  });
});

describe("hexToHsl", () => {
  it.each<[string, Hsl]>([
    ["FF0000", { h: 0, s: 100, l: 50 }],
    ["00FF00", { h: 120, s: 100, l: 50 }],
    ["0000FF", { h: 240, s: 100, l: 50 }],
    ["FFFF00", { h: 60, s: 100, l: 50 }],
    ["00FFFF", { h: 180, s: 100, l: 50 }],
    ["FF00FF", { h: 300, s: 100, l: 50 }],
    ["FFFFFF", { h: 0, s: 0, l: 100 }],
    ["000000", { h: 0, s: 0, l: 0 }],
    ["808080", { h: 0, s: 0, l: 50 }],
  ])("converts %s to expected HSL", (hex, expected) => {
    expect(hexToHsl(hex)).toEqual(expected);
  });

  it("accepts a leading #", () => {
    expect(hexToHsl("#FF0000")).toEqual({ h: 0, s: 100, l: 50 });
  });

  it("is case-insensitive", () => {
    expect(hexToHsl("1e5f93")).toEqual(hexToHsl("1E5F93"));
  });

  it("returns hue 0 for any greyscale colour (saturation is 0)", () => {
    // Hue is undefined when saturation is 0; we canonicalise to 0.
    expect(hexToHsl("404040").h).toBe(0);
    expect(hexToHsl("C0C0C0").h).toBe(0);
  });
});

describe("hslToHex", () => {
  it.each<[Hsl, string]>([
    [{ h: 0, s: 100, l: 50 }, "FF0000"],
    [{ h: 120, s: 100, l: 50 }, "00FF00"],
    [{ h: 240, s: 100, l: 50 }, "0000FF"],
    [{ h: 60, s: 100, l: 50 }, "FFFF00"],
    [{ h: 180, s: 100, l: 50 }, "00FFFF"],
    [{ h: 300, s: 100, l: 50 }, "FF00FF"],
    [{ h: 0, s: 0, l: 100 }, "FFFFFF"],
    [{ h: 0, s: 0, l: 0 }, "000000"],
    [{ h: 0, s: 0, l: 50 }, "808080"],
  ])("converts %j to %s", (hsl, expected) => {
    expect(hslToHex(hsl)).toBe(expected);
  });

  it("wraps hue values outside 0-360", () => {
    expect(hslToHex({ h: 360, s: 100, l: 50 })).toBe(
      hslToHex({ h: 0, s: 100, l: 50 }),
    );
    expect(hslToHex({ h: 480, s: 100, l: 50 })).toBe(
      hslToHex({ h: 120, s: 100, l: 50 }),
    );
    expect(hslToHex({ h: -30, s: 100, l: 50 })).toBe(
      hslToHex({ h: 330, s: 100, l: 50 }),
    );
  });

  it("clamps saturation and lightness to 0-100", () => {
    expect(hslToHex({ h: 0, s: 150, l: 50 })).toBe(
      hslToHex({ h: 0, s: 100, l: 50 }),
    );
    expect(hslToHex({ h: 0, s: -10, l: 50 })).toBe(
      hslToHex({ h: 0, s: 0, l: 50 }),
    );
    expect(hslToHex({ h: 0, s: 100, l: 150 })).toBe(
      hslToHex({ h: 0, s: 100, l: 100 }),
    );
    expect(hslToHex({ h: 0, s: 100, l: -10 })).toBe(
      hslToHex({ h: 0, s: 100, l: 0 }),
    );
  });
});

describe("hex <-> HSL round trip", () => {
  // HSL components are rounded to integers, so the round trip is not bit-exact
  // for arbitrary colours — allow ±2 per RGB channel.
  it.each([
    "FF0000",
    "00FF00",
    "0000FF",
    "FFFF00",
    "00FFFF",
    "FF00FF",
    "FFFFFF",
    "000000",
    "808080",
    "1E5F93",
    "E44C19",
    "F4DDBC",
    "EDA264",
    "093747",
  ])("%s survives hex -> HSL -> hex within ±2 per channel", (original) => {
    const roundtripped = hslToHex(hexToHsl(original));
    expectChannelsCloseTo(roundtripped, original, 2);
  });
});

function expectChannelsCloseTo(
  actual: string,
  expected: string,
  tolerance: number,
): void {
  for (let i = 0; i < 3; i++) {
    const a = parseInt(actual.slice(i * 2, i * 2 + 2), 16);
    const e = parseInt(expected.slice(i * 2, i * 2 + 2), 16);
    expect(Math.abs(a - e)).toBeLessThanOrEqual(tolerance);
  }
}

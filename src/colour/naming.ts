import type { NamedColour } from "./types";
import { normaliseHex } from "./utils";

/**
 * Subset of the Color Pizza response we actually use. The API returns
 * many more fields (rgb, hsl, lab, swatch URLs, etc.) which we ignore.
 */
interface ColourPizzaResponse {
  paletteTitle?: string;
  colors: Array<{
    name: string;
    requestedHex: string;
    bestContrast: "white" | "black";
  }>;
}

const API_BASE_URL = "https://api.color.pizza/v1/";

/**
 * Module-level cache: normalised hex → already-fetched NamedColour.
 * Lives for the duration of the page session. Cleared between tests via
 * `_clearNameCache`.
 */
const cache = new Map<string, NamedColour>();

/**
 * Look up names for a batch of hex codes via Color Pizza, returning them
 * in the same order as input. Uses the module-level cache, so previously
 * seen hexes don't hit the network. Hexes are matched case-insensitively.
 *
 * On network failure or a non-2xx response, the missing colours fall
 * back to using their hex as the name with a safe black contrast colour.
 * Failures are not cached — the next call retries.
 */
export async function fetchPaletteNames(
  hexes: string[],
): Promise<NamedColour[]> {
  if (hexes.length === 0) return [];

  const normalised = hexes.map(normaliseHex);
  const missing = normalised.filter((hex) => !cache.has(hex));

  if (missing.length > 0) {
    const fetched = await fetchFromApi(missing);
    for (const colour of fetched) {
      cache.set(colour.hex, colour);
    }
  }

  return normalised.map((hex) => {
    const colour = cache.get(hex);
    if (!colour) {
      throw new Error(`Color Pizza API did not return a name for ${hex}`);
    }
    return colour;
  });
}

/**
 * Internal — make the actual HTTP call. function rejects with an Error
 * on network failure, non-2xx responses, or incomplete responses,
 * so callers using useQuery can rely on isError.
 */
async function fetchFromApi(hexes: string[]): Promise<NamedColour[]> {
  const url = new URL(API_BASE_URL);
  url.searchParams.set("values", hexes.join(","));
  url.searchParams.set("noduplicates", "true");
  url.searchParams.set("goodnamesonly", "true");

  const res = await fetch(url, {
    headers: { "X-Referrer": "coloour-picker" },
  });
  if (!res.ok) {
    throw new Error(`Color Pizza API returned ${res.status}`);
  }

  const data = (await res.json()) as ColourPizzaResponse;
  return data.colors.map((c) => ({
    hex: normaliseHex(c.requestedHex),
    name: c.name,
    bestContrast: c.bestContrast,
  }));
}

/**
 * Test helper — clear the in-memory name cache. Used in `beforeEach`
 * blocks so tests start from a known empty state.
 */
export function _clearNameCache(): void {
  cache.clear();
}

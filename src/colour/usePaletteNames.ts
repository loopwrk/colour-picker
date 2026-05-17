import { useQuery } from "@tanstack/react-query";
import { fetchPaletteNames } from "./naming";
import type { NamedColour } from "./types";

/**
 * React hook for looking up palette colour names via Color Pizza.
 *
 * Architecture note: caching happens in two layers.
 *
 *   1. TanStack Query's cache is keyed on the *exact array of hexes*, so
 *      asking for the same palette twice returns instantly.
 *   2. The `Map<hex, NamedColour>` cache inside `naming.ts` is keyed on
 *      *individual hexes*. This is the layer that matters most: when one
 *      slot is locked across regenerations, the locked hex's name stays
 *      memoised even though the surrounding hexes change every time.
 *
 * `staleTime: Infinity` because a colour's name doesn't change.
 */
export function usePaletteNames(hexes: string[]) {
  return useQuery<NamedColour[]>({
    queryKey: ["paletteNames", hexes],
    queryFn: () => fetchPaletteNames(hexes),
    staleTime: Infinity,
  });
}

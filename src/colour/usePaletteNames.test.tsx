import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { _clearNameCache } from "./naming";
import type { NamedColour } from "./types";
import { usePaletteNames } from "./usePaletteNames";

/**
 * Build a fresh wrapper per test so each test gets its own QueryClient with
 * an empty cache. Sharing one client across tests leaks query state and
 * makes tests order-dependent.
 */
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

beforeEach(() => {
  _clearNameCache();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const TWO_COLOUR_RESPONSE = {
  paletteTitle: "Test Palette",
  colors: [
    {
      name: "Hyper Blue",
      requestedHex: "#1e5f93",
      bestContrast: "white" as const,
    },
    {
      name: "Baptism by Fire",
      requestedHex: "#e44c19",
      bestContrast: "black" as const,
    },
  ],
};

describe("usePaletteNames", () => {
  it("starts in a loading state", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(TWO_COLOUR_RESPONSE),
    );
    const { result } = renderHook(
      () => usePaletteNames(["1E5F93", "E44C19"]),
      { wrapper: createWrapper() },
    );
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("resolves to the named colours from the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(TWO_COLOUR_RESPONSE),
    );
    const { result } = renderHook(
      () => usePaletteNames(["1E5F93", "E44C19"]),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual<NamedColour[]>([
      { hex: "1E5F93", name: "Hyper Blue", bestContrast: "white" },
      { hex: "E44C19", name: "Baptism by Fire", bestContrast: "black" },
    ]);
  });

  it("reaches isError state when the network fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => usePaletteNames(["1E5F93"]), {
      wrapper: createWrapper(),
    });
    // fetchPaletteNames now lets the error propagate, so the query enters
    // the error state and exposes the underlying Error via `error`. The
    // component (sub-step 2.5) can use this to render a retry UI.
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it("hits the in-naming Map cache when a hex repeats in a later query", async () => {
    // First render: fetch returns the full two-colour response.
    const spy = vi.spyOn(globalThis, "fetch");
    spy.mockResolvedValueOnce(jsonResponse(TWO_COLOUR_RESPONSE));
    const wrapper = createWrapper();
    const { result, rerender } = renderHook(
      ({ hexes }: { hexes: string[] }) => usePaletteNames(hexes),
      { wrapper, initialProps: { hexes: ["1E5F93", "E44C19"] } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(spy).toHaveBeenCalledTimes(1);

    // Now re-render asking for ["1E5F93", "FFFFFF"]. 1E5F93 should be served
    // from the Map cache; only FFFFFF should hit the network.
    spy.mockResolvedValueOnce(
      jsonResponse({
        paletteTitle: "x",
        colors: [
          {
            name: "Pure White",
            requestedHex: "#ffffff",
            bestContrast: "black" as const,
          },
        ],
      }),
    );
    rerender({ hexes: ["1E5F93", "FFFFFF"] });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await waitFor(() =>
      expect(result.current.data?.map((c) => c.hex)).toEqual([
        "1E5F93",
        "FFFFFF",
      ]),
    );

    // Two fetches total, and the second only contained the uncached hex.
    expect(spy).toHaveBeenCalledTimes(2);
    const secondCallUrl = spy.mock.calls[1][0];
    const urlString =
      secondCallUrl instanceof URL
        ? secondCallUrl.toString()
        : String(secondCallUrl);
    expect(urlString).toContain("FFFFFF");
    expect(urlString).not.toContain("1E5F93");
  });

  it("hits TanStack Query's per-batch cache when the same hex array is queried twice", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(TWO_COLOUR_RESPONSE));
    const wrapper = createWrapper();

    // First call populates both caches.
    const { result: first } = renderHook(
      () => usePaletteNames(["1E5F93", "E44C19"]),
      { wrapper },
    );
    await waitFor(() => expect(first.current.isSuccess).toBe(true));

    // Second call with same key should resolve from TanStack's cache without
    // re-invoking the queryFn (and so without calling fetch again).
    const { result: second } = renderHook(
      () => usePaletteNames(["1E5F93", "E44C19"]),
      { wrapper },
    );
    await waitFor(() => expect(second.current.isSuccess).toBe(true));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

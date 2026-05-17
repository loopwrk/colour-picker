import { _clearNameCache, fetchPaletteNames } from "./naming";
import type { NamedColour } from "./types";

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

describe("fetchPaletteNames", () => {
  it("returns [] for empty input without calling fetch", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    const result = await fetchPaletteNames([]);
    expect(result).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it("returns named colours from a successful API response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(TWO_COLOUR_RESPONSE),
    );
    const result = await fetchPaletteNames(["1E5F93", "E44C19"]);
    expect(result).toEqual<NamedColour[]>([
      { hex: "1E5F93", name: "Hyper Blue", bestContrast: "white" },
      { hex: "E44C19", name: "Baptism by Fire", bestContrast: "black" },
    ]);
  });

  it("normalises mixed-case input to match the API's lowercase responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(TWO_COLOUR_RESPONSE),
    );
    const result = await fetchPaletteNames(["1e5f93", "e44c19"]);
    expect(result).toEqual<NamedColour[]>([
      { hex: "1E5F93", name: "Hyper Blue", bestContrast: "white" },
      { hex: "E44C19", name: "Baptism by Fire", bestContrast: "black" },
    ]);
  });

  it("uses the cache on a second call with the same hexes", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(TWO_COLOUR_RESPONSE));
    await fetchPaletteNames(["1E5F93", "E44C19"]);
    await fetchPaletteNames(["1E5F93", "E44C19"]);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("only fetches uncached hexes when partially cached", async () => {
    const spy = vi.spyOn(globalThis, "fetch");

    spy.mockResolvedValueOnce(
      jsonResponse({
        paletteTitle: "x",
        colors: [
          {
            name: "Hyper Blue",
            requestedHex: "#1e5f93",
            bestContrast: "white" as const,
          },
        ],
      }),
    );
    await fetchPaletteNames(["1E5F93"]);

    spy.mockResolvedValueOnce(
      jsonResponse({
        paletteTitle: "x",
        colors: [
          {
            name: "Baptism by Fire",
            requestedHex: "#e44c19",
            bestContrast: "black" as const,
          },
        ],
      }),
    );
    const result = await fetchPaletteNames(["1E5F93", "E44C19"]);

    expect(spy).toHaveBeenCalledTimes(2);

    // The second fetch should only have requested the uncached hex.
    const secondCallUrl = spy.mock.calls[1][0];
    const urlString =
      secondCallUrl instanceof URL
        ? secondCallUrl.toString()
        : String(secondCallUrl);
    expect(urlString).toContain("E44C19");
    expect(urlString).not.toContain("1E5F93");

    expect(result).toEqual<NamedColour[]>([
      { hex: "1E5F93", name: "Hyper Blue", bestContrast: "white" },
      { hex: "E44C19", name: "Baptism by Fire", bestContrast: "black" },
    ]);
  });

  it("rejects when the network fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network"));
    await expect(
      fetchPaletteNames(["1E5F93", "E44C19"]),
    ).rejects.toThrow();
  });

  it("rejects on a non-200 response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse({}, 500));
    await expect(fetchPaletteNames(["1E5F93"])).rejects.toThrow(
      /Color Pizza API returned 500/,
    );
  });

  it("rejects when the API returns fewer colours than requested", async () => {
    // Defensive case: API returns only one colour for a two-colour request.
    // Should throw rather than silently fill in undefined for the missing slot.
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        paletteTitle: "x",
        colors: [
          {
            name: "Hyper Blue",
            requestedHex: "#1e5f93",
            bestContrast: "white" as const,
          },
        ],
      }),
    );
    await expect(
      fetchPaletteNames(["1E5F93", "E44C19"]),
    ).rejects.toThrow(/did not return a name for E44C19/);
  });

  it("does not cache failed lookups (the next call can succeed)", async () => {
    const spy = vi.spyOn(globalThis, "fetch");
    spy.mockRejectedValueOnce(new Error("network"));
    await expect(fetchPaletteNames(["1E5F93"])).rejects.toThrow();

    spy.mockResolvedValueOnce(
      jsonResponse({
        paletteTitle: "x",
        colors: [
          {
            name: "Hyper Blue",
            requestedHex: "#1e5f93",
            bestContrast: "white" as const,
          },
        ],
      }),
    );
    const result = await fetchPaletteNames(["1E5F93"]);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(result).toEqual<NamedColour[]>([
      { hex: "1E5F93", name: "Hyper Blue", bestContrast: "white" },
    ]);
  });

  it("includes the X-Referrer header on requests", async () => {
    const spy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse(TWO_COLOUR_RESPONSE));
    await fetchPaletteNames(["1E5F93"]);
    const [, init] = spy.mock.calls[0];
    expect(init?.headers).toMatchObject({ "X-Referrer": expect.any(String) });
  });
});

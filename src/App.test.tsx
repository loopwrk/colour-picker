import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import App from "./App";
import { _clearNameCache } from "./colour/naming";

/**
 * Fresh QueryClient per test so we don't leak query state across tests
 * (same pattern we used in usePaletteNames.test.tsx).
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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Permissive fetch mock — looks at the `values` query string in the
 * request URL and returns a fake name for whichever hexes were asked
 * for. This lets us assert on names without having to predict the exact
 * hexes the generator will produce from any given random seed.
 */
function mockFetchEcho() {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
    const url = input instanceof URL ? input : new URL(String(input));
    const values = url.searchParams.get("values") ?? "";
    const hexes = values.split(",").filter(Boolean);
    return Promise.resolve(
      jsonResponse({
        paletteTitle: "Mocked",
        colors: hexes.map((hex, i) => ({
          name: `Mock Colour ${i + 1}`,
          requestedHex: "#" + hex.toLowerCase(),
          bestContrast: "white" as const,
        })),
      }),
    );
  });
}

/**
 * jsdom doesn't implement matchMedia. The theme hook calls it on mount
 * to detect OS preference, so every App test would crash without this
 * shim. Light mode by default; tests that care can re-install with
 * `installMatchMedia(true)`.
 */
function installMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

beforeEach(() => {
  _clearNameCache();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  installMatchMedia(false);
});

afterEach(() => {
  vi.restoreAllMocks();
  document.documentElement.classList.remove("dark");
});

describe("App", () => {
  it("renders a Generate button", () => {
    mockFetchEcho();
    render(<App />, { wrapper: createWrapper() });
    expect(
      screen.getByRole("button", { name: /generate/i }),
    ).toBeInTheDocument();
  });

  it("renders 5 swatches on initial load", () => {
    mockFetchEcho();
    const { container } = render(<App />, { wrapper: createWrapper() });
    const swatches = container.querySelectorAll("section svg > g > path");
    expect(swatches).toHaveLength(5);
  });

  it("shows the colour names once the API resolves", async () => {
    mockFetchEcho();
    render(<App />, { wrapper: createWrapper() });

    const firstMatches = await screen.findAllByText(/Mock Colour 1/);
    expect(firstMatches.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mock Colour 5/).length).toBeGreaterThan(0);
  });

  it("clicking Generate produces a different palette", async () => {
    mockFetchEcho();
    const randomSpy = vi.spyOn(Math, "random");
    randomSpy.mockReturnValue(0); // first palette → baseHue 0

    const user = userEvent.setup();
    const { container } = render(<App />, { wrapper: createWrapper() });

    // Each slice's colour lives in the path's `fill` attribute now —
    // SVG <path> elements don't have text content to read. Descendant
    // selector because the SVG is nested inside LabelledDonut's wrapper.
    const readFills = () =>
      Array.from(container.querySelectorAll("section svg > g > path")).map(
        (el) => el.getAttribute("fill"),
      );

    const firstFills = readFills();
    expect(firstFills).toHaveLength(5);

    randomSpy.mockReturnValue(0.5); // second palette → baseHue 180
    await user.click(screen.getByRole("button", { name: /generate/i }));

    await waitFor(() => {
      expect(readFills()).not.toEqual(firstFills);
    });
  });

  it("shows an error banner and a retry button when the API fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network"));
    render(<App />, { wrapper: createWrapper() });
    expect(
      await screen.findByText(/Couldn't load colour names/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("removes the dark class on <html> when the theme button is clicked", async () => {
    mockFetchEcho();
    const user = userEvent.setup();
    render(<App />, { wrapper: createWrapper() });

    // Starts in dark mode (matchMedia mock returns matches:false).
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    await user.click(
      screen.getByRole("button", { name: /switch to light mode/i }),
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // The button's aria-label flips with the state.
    await user.click(
      screen.getByRole("button", { name: /switch to dark mode/i }),
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("regenerates the palette when the harmony mode changes", async () => {
    mockFetchEcho();
    const randomSpy = vi.spyOn(Math, "random");
    randomSpy.mockReturnValue(0); // deterministic seed throughout

    const user = userEvent.setup();
    const { container } = render(<App />, { wrapper: createWrapper() });

    const readFills = () =>
      Array.from(container.querySelectorAll("section svg > g > path")).map(
        (el) => el.getAttribute("fill"),
      );

    const splitFills = readFills();
    expect(splitFills).toHaveLength(5);

    await user.click(screen.getByRole("radio", { name: /^shades$/i }));

    await waitFor(() => {
      // Same base hue (Math.random pinned to 0) but a different recipe,
      // so the rendered fills must change.
      expect(readFills()).not.toEqual(splitFills);
    });
  });

  it("preserves a locked slot's hex across regeneration", async () => {
    mockFetchEcho();
    const randomSpy = vi.spyOn(Math, "random");
    randomSpy.mockReturnValue(0); // initial palette → baseHue 0

    const user = userEvent.setup();
    const { container } = render(<App />, { wrapper: createWrapper() });

    const readFills = () =>
      Array.from(container.querySelectorAll("section svg > g > path")).map(
        (el) => el.getAttribute("fill"),
      );

    const before = readFills();

    // Lock the third slice by clicking its corresponding row's lock
    // button.
    const thirdHex = before[2]?.replace("#", "");
    const rowsList = screen.getByRole("list");
    await user.click(
      within(rowsList).getByRole("button", {
        name: new RegExp(`Lock colour ${thirdHex}`, "i"),
      }),
    );

    randomSpy.mockReturnValue(0.5); // next palette would use baseHue 180
    await user.click(screen.getByRole("button", { name: /generate/i }));

    await waitFor(() => {
      const after = readFills();
      // The locked slot stayed; at least one of the others changed.
      expect(after[2]).toBe(before[2]);
      expect(after).not.toEqual(before);
    });
  });
});

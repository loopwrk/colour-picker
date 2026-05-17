import { render, screen, waitFor } from "@testing-library/react";
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

beforeEach(() => {
  _clearNameCache();
});

afterEach(() => {
  vi.restoreAllMocks();
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
    const swatches = container.querySelectorAll("section svg > path");
    expect(swatches).toHaveLength(5);
  });

  it("shows the colour names once the API resolves", async () => {
    mockFetchEcho();
    render(<App />, { wrapper: createWrapper() });
    expect(await screen.findByText(/Mock Colour 1/)).toBeInTheDocument();
    expect(screen.getByText(/Mock Colour 5/)).toBeInTheDocument();
  });

  it("clicking Generate produces a different palette", async () => {
    mockFetchEcho();
    // Force a known base hue per render so the two palettes are
    // deterministic and provably different.
    const randomSpy = vi.spyOn(Math, "random");
    randomSpy.mockReturnValue(0); // first palette → baseHue 0

    const user = userEvent.setup();
    const { container } = render(<App />, { wrapper: createWrapper() });

    // Each slice's colour lives in the path's `fill` attribute now —
    // SVG <path> elements don't have text content to read. Descendant
    // selector because the SVG is nested inside LabelledDonut's wrapper.
    const readFills = () =>
      Array.from(container.querySelectorAll("section svg > path")).map((el) =>
        el.getAttribute("fill"),
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
    expect(
      screen.getByRole("button", { name: /retry/i }),
    ).toBeInTheDocument();
  });
});

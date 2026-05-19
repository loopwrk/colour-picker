import { act, renderHook } from "@testing-library/react";

import { useTheme } from "./useTheme.ts";

/**
 * jsdom doesn't implement matchMedia. We install a minimal mock before
 * each test so `useTheme`'s "respect OS preference" path can run, then
 * remove it afterwards.
 *
 * The mock returns `matches: false` by default (so the default theme is
 * light); individual tests can override by re-installing the mock with
 * `matches: true`.
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
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  installMatchMedia(false);
});

afterEach(() => {
  // Tidy up any test that toggled the class on the root.
  document.documentElement.classList.remove("dark");
});

describe("useTheme", () => {
  it("defaults to dark mode", () => {
    installMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles between light and dark", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");

    act(() => result.current.toggle());
    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

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
  it("defaults to light when no preference is stored and OS prefers light", () => {
    installMatchMedia(false);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("defaults to dark when no preference is stored but OS prefers dark", () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("prefers the stored value over the OS preference", () => {
    installMatchMedia(true); // OS says dark
    localStorage.setItem("theme", "light");
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("toggles between light and dark", () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");

    act(() => result.current.toggle());
    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    act(() => result.current.toggle());
    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists the choice to localStorage on every change", () => {
    const { result } = renderHook(() => useTheme());
    // Initial effect ran, so localStorage should already be set.
    expect(localStorage.getItem("theme")).toBe("light");

    act(() => result.current.toggle());
    expect(localStorage.getItem("theme")).toBe("dark");
  });
});

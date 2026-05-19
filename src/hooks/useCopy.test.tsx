import { act, renderHook } from "@testing-library/react";

import { useCopy } from "./useCopy.ts";

/**
 * Install a writable navigator.clipboard with a vi.fn() writeText. jsdom
 * doesn't provide one. Each test gets a fresh mock so the call records
 * don't bleed across cases.
 */
function installClipboard(impl: (text: string) => Promise<void>) {
  const writeText = vi.fn(impl);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  return writeText;
}

afterEach(() => {
  // Restore real timers between tests in case one used fake timers.
  vi.useRealTimers();
  // Wipe the clipboard mock so the next test starts clean.
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: undefined,
  });
});

describe("useCopy", () => {
  it("starts in the idle state with no value", () => {
    installClipboard(() => Promise.resolve());
    const { result } = renderHook(() => useCopy());
    expect(result.current.status).toBe("idle");
    expect(result.current.value).toBeNull();
  });

  it("writes the text to the clipboard when copy() is called", async () => {
    const writeText = installClipboard(() => Promise.resolve());
    const { result } = renderHook(() => useCopy());

    await act(async () => {
      await result.current.copy("#FF6842");
    });

    expect(writeText).toHaveBeenCalledWith("#FF6842");
  });

  it("transitions to success and exposes the copied value", async () => {
    installClipboard(() => Promise.resolve());
    const { result } = renderHook(() => useCopy());

    await act(async () => {
      await result.current.copy("#FF6842");
    });

    expect(result.current.status).toBe("success");
    expect(result.current.value).toBe("#FF6842");
  });

  it("returns to idle after the timeout", async () => {
    vi.useFakeTimers();
    installClipboard(() => Promise.resolve());
    const { result } = renderHook(() => useCopy(1500));

    await act(async () => {
      await result.current.copy("#FF6842");
    });
    expect(result.current.status).toBe("success");

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.value).toBeNull();
  });

  it("transitions to error when writeText rejects", async () => {
    // Silence the console.error so the test output stays clean.
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    installClipboard(() => Promise.reject(new Error("permission denied")));
    const { result } = renderHook(() => useCopy());

    await act(async () => {
      await result.current.copy("#FF6842");
    });

    expect(result.current.status).toBe("error");
    expect(errSpy).toHaveBeenCalled();
  });

  it("transitions to error when navigator.clipboard is unavailable", async () => {
    // Don't install a clipboard at all — writeText on undefined throws.
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useCopy());

    await act(async () => {
      await result.current.copy("#FF6842");
    });

    expect(result.current.status).toBe("error");
    expect(errSpy).toHaveBeenCalled();
  });

  it("clears the previous success's pending timeout on a second copy", async () => {
    // Regression guard: if the consumer copies twice in quick
    // succession, the FIRST copy's auto-reset timer must not fire and
    // clobber the SECOND copy's success state.
    vi.useFakeTimers();
    installClipboard(() => Promise.resolve());
    const { result } = renderHook(() => useCopy(1500));

    await act(async () => {
      await result.current.copy("#FF0000");
    });
    expect(result.current.value).toBe("#FF0000");

    // 1s in — first timer still pending. Fire the second copy.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await act(async () => {
      await result.current.copy("#00FF00");
    });

    // The first copy's timer would have fired at 1500ms total; advance
    // past that point and confirm the success state is STILL the
    // second copy, not idle.
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current.status).toBe("success");
    expect(result.current.value).toBe("#00FF00");

    // After the second copy's own 1500ms elapses, we return to idle.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.status).toBe("idle");
    expect(result.current.value).toBeNull();
  });

  it("respects a custom timeout", async () => {
    vi.useFakeTimers();
    installClipboard(() => Promise.resolve());
    const { result } = renderHook(() => useCopy(500));

    await act(async () => {
      await result.current.copy("#FF6842");
    });
    expect(result.current.status).toBe("success");

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.status).toBe("success");

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.status).toBe("idle");
  });
});

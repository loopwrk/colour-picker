import { useState, useCallback, useEffect, useRef } from "react";

export type CopyStatus = "idle" | "copying" | "success" | "error";

/**
 * Hook for "copy text to clipboard, then briefly show a confirmation".
 *
 * Returns:
 *   - copy(text): writes to the clipboard, then schedules an auto-reset
 *   - status: 'idle' | 'copying' | 'success' | 'error'
 *   - value:  the last text passed to copy() (or null when idle)
 *
 */
export function useCopy(timeout = 850) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const [value, setValue] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearResetTimer = useCallback(() => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const scheduleReset = useCallback(() => {
    clearResetTimer();
    timerRef.current = setTimeout(() => {
      setStatus("idle");
      setValue(null);
      timerRef.current = undefined;
    }, timeout);
  }, [clearResetTimer, timeout]);

  const copy = useCallback(
    async (text: string) => {
      // Kill any pending reset from a previous copy first
      clearResetTimer();
      setStatus("copying");
      setValue(text);
      try {
        await navigator.clipboard.writeText(text);
        setStatus("success");
        scheduleReset();
      } catch (error) {
        console.error("Failed to copy:", error);
        setStatus("error");
        scheduleReset();
      }
    },
    [clearResetTimer, scheduleReset],
  );

  // Clear the pending reset timer on unmount so it doesn't fire
  // against a torn-down component.
  useEffect(() => {
    return () => clearResetTimer();
  }, [clearResetTimer]);

  return { copy, status, value };
}

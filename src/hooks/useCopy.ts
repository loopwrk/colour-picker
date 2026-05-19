import { useState, useCallback, useEffect } from "react";

type CopyStatus = "idle" | "copying" | "success" | "error";

export function useCopy(timeout = 2000) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const [value, setValue] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    setStatus("copying");
    setValue(text);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("success");
    } catch (error) {
      console.error("Failed to copy:", error);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (status === "success" || status === "error") {
      const handler = setTimeout(() => {
        setStatus("idle");
        setValue(null);
      }, timeout);
      return () => clearTimeout(handler);
    }
  }, [status, timeout]);

  return { copy, status, value };
}

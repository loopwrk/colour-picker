import { useState, useEffect, useCallback } from "react";
import { Alert, Button } from "flowbite-react";
import { useTranslation } from "react-i18next";
import { LabelledDonut } from "./components/LabelledDonut";
import { PaletteRows } from "./components/PaletteRows";
import { HarmonyModeSelector } from "./components/HarmonyModeSelector";
import { useCopy } from "./hooks/useCopy";
import { useTheme } from "./hooks/useTheme";
import { MoonIcon, SunIcon } from "./components/icons";
import { generatePalette, RECIPES, type HarmonyMode } from "./colour/harmony";
import { usePaletteNames } from "./colour/usePaletteNames";
import type { Colour } from "./colour/types";

function App() {
  const { t } = useTranslation();
  const { theme, toggle: toggleTheme } = useTheme();
  const { copy, value: copiedHex } = useCopy();
  const [mode, setMode] = useState<HarmonyMode>("split-complementary");
  const [layout, setLayout] = useState<"radial" | "column">("column");
  const [palette, setPalette] = useState<Colour[]>(() =>
    generatePalette(RECIPES[mode]),
  );
  const namesQuery = usePaletteNames(palette.map((colour) => colour.hex));

  const regenerate = useCallback((nextMode: HarmonyMode) => {
    setPalette((current) => {
      const fresh = generatePalette(RECIPES[nextMode]);
      return fresh.map((c, i) => (current[i].locked ? current[i] : c));
    });
  }, []);

  const handleGenerate = () => regenerate(mode);

  const handleModeChange = (nextMode: HarmonyMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    regenerate(nextMode);
  };

  const handleLockToggle = (index: number) => {
    setPalette((current) =>
      current.map((c, i) => (i === index ? { ...c, locked: !c.locked } : c)),
    );
  };

  const handleCopy = (hex: string) => copy(`#${hex}`);

  // Global Space-bar shortcut: regenerate the palette from anywhere
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.key !== " ") return;

      const target = e.target as HTMLElement | null;

      // Don't hijack space while the user is typing.
      if (target instanceof HTMLInputElement) return;
      if (target instanceof HTMLTextAreaElement) return;
      if (target instanceof HTMLElement && target.isContentEditable) return;

      // Donut slice paths expose role="button" and run their own Space
      // handler (toggle lock). Skip them so we don't double-fire.
      if (target?.getAttribute("role") === "button") return;
      // The Generate button activates natively on Space
      if (
        target instanceof HTMLElement &&
        target.dataset.shortcut === "generate"
      )
        return;
      e.preventDefault();
      regenerate(mode);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, regenerate]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 md:p-8 flex flex-col gap-4 md:gap-8">
      <header>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {t("app.title")}
        </h1>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === "dark"
              ? t("app.theme.switchToLight")
              : t("app.theme.switchToDark")
          }
          className="p-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      {namesQuery.isError && (
        <Alert color="failure">
          <div className="flex items-center gap-3">
            <span className="font-medium">{t("app.error.namesFailed")}</span>
            <Button onClick={() => namesQuery.refetch()}>
              {t("app.error.retry")}
            </Button>
          </div>
        </Alert>
      )}

      {layout === "radial" ? (
        <>
          <section className="mx-auto w-full max-w-70 md:max-w-175 md:px-16 md:pt-12 md:pb-32">
            <LabelledDonut
              palette={palette}
              names={namesQuery.data}
              onSliceClick={handleLockToggle}
              copiedHex={copiedHex}
              onCopy={handleCopy}
            />
          </section>
          <PaletteRows
            palette={palette}
            names={namesQuery.data}
            className="md:hidden"
            onLockToggle={handleLockToggle}
            copiedHex={copiedHex}
            onCopy={handleCopy}
          />
        </>
      ) : (
        <section className="mx-auto w-full max-w-70 md:max-w-4xl md:py-12 md:grid md:grid-cols-2 md:gap-12 md:items-center">
          <LabelledDonut
            palette={palette}
            names={namesQuery.data}
            onSliceClick={handleLockToggle}
            copiedHex={copiedHex}
            onCopy={handleCopy}
            showLabels={false}
          />
          <PaletteRows
            palette={palette}
            names={namesQuery.data}
            onLockToggle={handleLockToggle}
            copiedHex={copiedHex}
            onCopy={handleCopy}
            hoverBackgroundOnDesktop
          />
        </section>
      )}

      <HarmonyModeSelector mode={mode} onChange={handleModeChange} />

      <Button
        onClick={handleGenerate}
        data-shortcut="generate"
        className="md:fixed md:bottom-6 md:right-6 md:z-50 w-full md:w-auto"
        pill
      >
        {t("app.generate")}
        <span aria-hidden="true" className="ml-2 font-mono text-base">
          ⎵
        </span>
      </Button>

      <div role="status" aria-live="polite" className="sr-only">
        {copiedHex ? t("app.copy.announced", { value: copiedHex }) : ""}
      </div>

      {import.meta.env.DEV && (
        <button
          type="button"
          onClick={() =>
            setLayout((l) => (l === "radial" ? "column" : "radial"))
          }
          aria-label="Toggle palette layout (dev only)"
          className="fixed bottom-6 left-6 z-50 px-3 py-1.5 text-xs font-mono rounded-full bg-slate-900/80 dark:bg-slate-100/80 text-slate-100 dark:text-slate-900 opacity-50 hover:opacity-100 transition-opacity"
        >
          layout: {layout}
        </button>
      )}
    </div>
  );
}

export default App;

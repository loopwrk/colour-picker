import { useState } from "react";
import { Alert, Button } from "flowbite-react";
import { useTranslation } from "react-i18next";
import { LabelledDonut } from "./components/LabelledDonut";
import { PaletteRows } from "./components/PaletteRows";
import { useTheme } from "./hooks/useTheme.ts";
import { MoonIcon, SunIcon } from "./components/icons";
import { generatePalette, SPLIT_COMPLEMENTARY } from "./colour/harmony";
import { usePaletteNames } from "./colour/usePaletteNames";
import type { Colour } from "./colour/types";

function App() {
  const { t } = useTranslation();
  const { theme, toggle: toggleTheme } = useTheme();
  const [palette, setPalette] = useState<Colour[]>(
    () => generatePalette(SPLIT_COMPLEMENTARY)
  );
  const namesQuery = usePaletteNames(palette.map((colour) => colour.hex));
  const handleGenerate = () => {
    setPalette((current) => {
      const fresh = generatePalette(SPLIT_COMPLEMENTARY);
      // Locked slots keep their existing entry; unlocked slots take the
      // freshly-generated one.
      return fresh.map((c, i) => (current[i].locked ? current[i] : c));
    });
  };
  const handleLockToggle = (index: number) => {
  setPalette((current) =>
    current.map((c, i) =>
      i === index ? { ...c, locked: !c.locked } : c,
    ),
  );
};

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 md:p-8 flex flex-col gap-4">
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

      <section className="mx-auto w-full max-w-70 md:max-w-175 md:px-16 md:py-12">
        <LabelledDonut
          palette={palette}
          names={namesQuery.data}
          onSliceClick={handleLockToggle}
        />
      </section>

      <PaletteRows
        palette={palette}
        names={namesQuery.data}
        className="md:hidden"
        onLockToggle={handleLockToggle}
      />

      <Button
        onClick={handleGenerate}
        className="md:fixed md:bottom-6 md:right-6 md:z-50 w-full md:w-auto md:self-end"
        pill
      >
        {t("app.generate")}
      </Button>
    </div>
);
}

export default App;
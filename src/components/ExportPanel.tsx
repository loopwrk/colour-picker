import { useId, useState, useEffect } from "react";
import { useCopy } from "../hooks/useCopy";
import { formatColour } from "../colour/spaces";
import { formatPalette } from "../colour/formats";
import { useTranslation } from "react-i18next";
import { Button, Checkbox, Label } from "flowbite-react";
import {
  COLOUR_SPACES,
  OUTPUT_FORMATS,
  type ColourSpace,
  type OutputFormat,
} from "../colour/export";
import type { Colour } from "../colour/types";
import { CopyIcon, CheckIcon } from "./icons";

const STORAGE_KEY = "colour-picker:export-settings";

interface StoredSettings {
  colourSpace: ColourSpace;
  outputFormat: OutputFormat;
}

function readStoredSettings(): StoredSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Partial<StoredSettings>;
    if (
      !candidate.colourSpace ||
      !COLOUR_SPACES.includes(candidate.colourSpace)
    )
      return null;
    if (
      !candidate.outputFormat ||
      !OUTPUT_FORMATS.includes(candidate.outputFormat)
    )
      return null;
    return {
      colourSpace: candidate.colourSpace,
      outputFormat: candidate.outputFormat,
    };
  } catch {
    return null;
  }
}

interface ExportPanelProps {
  palette: Colour[];
  onClose: () => void;
  /** Extra classes for the outer container (e.g., responsive visibility). */
  className?: string;
}

/**
 * The export panel: two radio groups (colour space + output format),
 * a condensed palette strip, and a footer with Copy swatch + Remember
 * settings. Copy is a no-op for now, add in later.
 */

export function ExportPanel({
  palette,
  onClose,
  className = "",
}: ExportPanelProps) {
  const { t } = useTranslation();
  const stored = readStoredSettings();
  const [colourSpace, setColourSpace] = useState<ColourSpace>(
    stored?.colourSpace ?? "oklch",
  );
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(
    stored?.outputFormat ?? "css-variables",
  );
  const [remember, setRemember] = useState<boolean>(stored !== null);

  const rememberId = useId();

  useEffect(() => {
    if (remember) {
      const payload: StoredSettings = { colourSpace, outputFormat };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [remember, colourSpace, outputFormat]);

  const { copy, status: copyStatus } = useCopy();

  const handleCopy = () => {
    const formattedColours = palette.map((c) =>
      formatColour(c.hex, colourSpace),
    );
    const output = formatPalette(formattedColours, outputFormat);
    copy(output);
  };

  return (
    <div
      className={`flex flex-col gap-5 p-5 bg-slate-50 dark:bg-slate-900 rounded-lg h-full overflow-y-auto ${className}`}
    >
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {t("app.export.title")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("app.export.close")}
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="flex flex-col gap-1.5">
        <div className="flex w-full h-10 rounded-md overflow-hidden">
          {palette.map((c, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: `#${c.hex}` }}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="flex w-full text-[10px] font-mono text-slate-600 dark:text-slate-400">
          {palette.map((c, i) => (
            <div key={i} className="flex-1 text-center truncate">
              {c.hex}
            </div>
          ))}
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {t("app.export.colourSpaceLegend")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {COLOUR_SPACES.map((space) => {
            const isActive = space === colourSpace;
            return (
              <button
                key={space}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setColourSpace(space)}
                className={
                  "px-3 py-1.5 text-sm rounded-full transition-colors " +
                  (isActive
                    ? "bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700")
                }
              >
                {t(`app.export.spaces.${space}`)}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {t("app.export.outputFormatLegend")}
        </legend>
        <div className="flex flex-wrap gap-2">
          {OUTPUT_FORMATS.map((format) => {
            const isActive = format === outputFormat;
            return (
              <button
                key={format}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setOutputFormat(format)}
                className={
                  "px-3 py-1.5 text-sm rounded-full transition-colors " +
                  (isActive
                    ? "bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700")
                }
              >
                {t(`app.export.formats.${format}`)}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id={rememberId}
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          <Label htmlFor={rememberId} className="text-sm cursor-pointer">
            {t("app.export.remember")}
          </Label>
        </div>
        <Button onClick={handleCopy} pill>
          {copyStatus === "success" ? (
            <>
              <CheckIcon className="w-4 h-4 mr-2" />
              {t("app.export.copied")}
            </>
          ) : (
            <>
              <CopyIcon className="w-4 h-4 mr-2" />
              {t("app.export.copySwatch")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

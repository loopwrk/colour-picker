import { useTranslation } from "react-i18next";
import { CopyIcon, CheckIcon, LockIcon } from "./icons";
import type { Colour, NamedColour } from "../colour/types";

interface PaletteRowsProps {
  palette: Colour[];
  names?: NamedColour[];
  onLockToggle?: (index: number) => void;
  copiedHex?: string | null;
  onCopy?: (hex: string) => void;
  className?: string;
  hoverBackgroundOnDesktop?: boolean;
}

export function PaletteRows({
  palette,
  names,
  onLockToggle,
  copiedHex,
  onCopy,
  className = "",
  hoverBackgroundOnDesktop = false,
}: PaletteRowsProps) {
  const { t } = useTranslation();

  return (
    <ul className={`flex flex-col gap-2 ${className}`}>
      {palette.map((colour, index) => {
        const isCopied = copiedHex === `#${colour.hex}`;
        const rowBg = hoverBackgroundOnDesktop
          ? "bg-slate-200/60 dark:bg-slate-800/60 md:bg-transparent dark:md:bg-transparent md:hover:bg-slate-200/60 dark:md:hover:bg-slate-800/60"
          : "bg-slate-200/60 dark:bg-slate-800/60";
        return (
          <li
            key={index}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${rowBg}`}
          >
            <button
              type="button"
              onClick={() => onCopy?.(colour.hex)}
              aria-label={t("app.copy.label", { hex: colour.hex })}
              className="group flex items-center gap-3 flex-1 min-w-0 cursor-pointer rounded text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              <span
                className="w-8 h-8 rounded shrink-0"
                style={{ backgroundColor: `#${colour.hex}` }}
                aria-hidden="true"
              />
              {isCopied ? (
                <span className="flex items-center gap-1.5 font-mono text-base text-emerald-600 dark:text-emerald-400">
                  <CheckIcon className="w-4 h-4" />
                  {t("app.copy.copied")}
                </span>
              ) : (
                <>
                  <span className="font-mono text-base text-slate-900 dark:text-slate-100">
                    {colour.hex}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 flex-1 truncate">
                    {names?.[index]?.name ?? ""}
                  </span>
                  <CopyIcon className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-60 transition-opacity ml-auto" />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onLockToggle?.(index)}
              aria-pressed={colour.locked}
              aria-label={
                colour.locked
                  ? `Unlock colour ${colour.hex}`
                  : `Lock colour ${colour.hex}`
              }
              className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shrink-0 p-1 -m-1 rounded"
            >
              {colour.locked ? <LockIcon /> : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

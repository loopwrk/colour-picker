import { useTranslation } from "react-i18next";
import type { Colour, NamedColour } from "../colour/types";
import { DonutSwatch } from "./DonutSwatch";
import { getLabelPosition } from "./donut-geometry";
import { CopyIcon, CheckIcon, LockIcon } from "./icons";

interface LabelledDonutProps {
  palette: Colour[];
  names?: NamedColour[];
  onSliceClick?: (index: number) => void;
  copiedHex?: string | null;
  onCopy?: (hex: string) => void;
  showLabels?: boolean;
}

const radiusPercent = 65;

export function LabelledDonut({
  palette,
  names,
  onSliceClick,
  copiedHex,
  onCopy,
  showLabels = true,
}: LabelledDonutProps) {
  const { t } = useTranslation();
  const swatchLabels = palette.map((colour, sliceIndex) => {
    const { xPercent, yPercent } = getLabelPosition(
      sliceIndex,
      palette.length,
      radiusPercent,
    );
    const indexStr = String(sliceIndex + 1).padStart(2, "0");
    const isCopied = copiedHex === `#${colour.hex}`;

    return (
      <button
        key={sliceIndex}
        type="button"
        onClick={() => onCopy?.(colour.hex)}
        aria-label={t("app.copy.label", { hex: colour.hex })}
        style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
        className="group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center select-none cursor-pointer rounded-md px-2 py-1 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
      >
        {isCopied ? (
          <span className="flex items-center gap-1.5 font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
            <CheckIcon className="w-4 h-4" />
            {t("app.copy.copied")}
          </span>
        ) : (
          <>
            <div className="flex items-center gap-1.5 text-lg uppercase tracking-wider text-slate-500">
              <span>{indexStr}</span>
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: `#${colour.hex}` }}
              />
              {colour.locked ? (
                <LockIcon className="w-3 h-3 text-slate-700 dark:text-slate-300" />
              ) : (
                <CopyIcon className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
              )}
            </div>

            <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
              {colour.hex}
            </span>

            <span className="text-sm text-slate-600 dark:text-slate-400">
              {names?.[sliceIndex]?.name ?? ""}
            </span>
          </>
        )}
      </button>
    );
  });

  return (
    <div className="relative w-full aspect-square">
      <DonutSwatch palette={palette} onSliceClick={onSliceClick} />
      {showLabels && <div className="hidden md:block">{swatchLabels}</div>}
    </div>
  );
}

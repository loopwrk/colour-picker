import type { Colour, NamedColour } from "../colour/types";
import { DonutSwatch } from "./DonutSwatch";
import { getLabelPosition } from "./donut-geometry";
import { LockIcon } from "./icons";

interface LabelledDonutProps {
  palette: Colour[];
  names?: NamedColour[];
  onSliceClick?: (index: number) => void;
}

const radiusPercent = 65;

export function LabelledDonut({
  palette,
  names,
  onSliceClick,
}: LabelledDonutProps) {
  const swatchLabels = palette.map((colour, sliceIndex) => {
    const { xPercent, yPercent } = getLabelPosition(
      sliceIndex,
      palette.length,
      radiusPercent,
    );
    const indexStr = String(sliceIndex + 1).padStart(2, "0");

    return (
      <div
        key={sliceIndex}
        style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center select-none pointer-events-none"
      >
        {/* Line 1: index + dot */}
        <div className="flex items-center gap-1.5 text-lg uppercase tracking-wider text-slate-500">
          <span>{indexStr}</span>
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: `#${colour.hex}` }}
          />
          {colour.locked && (
            <LockIcon className="w-3 h-3 text-slate-700 dark:text-slate-300" />
          )}
        </div>

        {/* Line 2: hex */}
        <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
          {colour.hex}
        </span>

        {/* Line 3: name */}
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {names?.[sliceIndex]?.name ?? ""}
        </span>
      </div>
    );
  });

  return (
    <div className="relative w-full aspect-square">
      <DonutSwatch palette={palette} onSliceClick={onSliceClick} />
      <div className="hidden md:block">{swatchLabels}</div>
    </div>
  );
}

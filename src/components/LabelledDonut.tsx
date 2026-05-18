import type { Colour, NamedColour } from "../colour/types";
import { DonutSwatch } from "./DonutSwatch";
import { getLabelPosition } from "./donut-geometry";

interface LabelledDonutProps {
  palette: Colour[];
  names?: NamedColour[];
}

const radiusPercent = 65;

export function LabelledDonut({ palette, names }: LabelledDonutProps) {
  const swatchLabels = palette.map((colour, sliceIndex) => {
    const { yPercentage, topPercent } = getLabelPosition(
      sliceIndex,
      palette.length,
      radiusPercent,
    );
    const indexStr = String(sliceIndex + 1).padStart(2, "0");

    return (
      <div
        key={sliceIndex}
        style={{ left: `${yPercentage}%`, top: `${topPercent}%` }}
        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center select-none pointer-events-none"
      >
        {/* Line 1: index + dot */}
        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
          <span>{indexStr}</span>
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: `#${colour.hex}` }}
          />
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
    <DonutSwatch palette={palette} />
    <div className="hidden md:block">{swatchLabels}</div>
  </div>
);
}


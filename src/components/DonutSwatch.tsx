import type { Colour } from "../colour/types";
import { getSlicePath } from "./donut-geometry";

/**
 * The SVG's internal coordinate space. Decoupled from rendered pixel size,
 * CSS controls how large the donut appears.
 */
const VIEWBOX_SIZE = 100;

interface DonutSwatchProps {
  palette: Colour[];
  holeRatio?: number;
  onSliceClick?: (index: number) => void;
}

export function DonutSwatch({
  palette,
  holeRatio = 0.42,
  onSliceClick,
}: DonutSwatchProps) {
  const cx = VIEWBOX_SIZE / 2;
  const cy = VIEWBOX_SIZE / 2;
  const R = VIEWBOX_SIZE / 2.1;
  const r = R * holeRatio;
  const sliceAngle = palette.length === 0 ? 0 : 360 / palette.length;

  const slices = palette.map((colour, i) => ({
    hex: colour.hex,
    pathData: getSlicePath(cx, cy, r, R, i * sliceAngle, (i + 1) * sliceAngle),
    locked: colour.locked,
  }));

  const isInteractive = Boolean(onSliceClick);

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto max-w-375 aspect-square"
      role="img"
      aria-label="Colour palette donut chart"
    >
      {slices.map((slice, index) => (
        <path
          key={index}
          d={slice.pathData}
          fill={`#${slice.hex}`}
          stroke={slice.locked ? "#f1f5f9" : "none"}
          strokeWidth={slice.locked ? 1.5 : 0}
          onClick={isInteractive ? () => onSliceClick?.(index) : undefined}
          onKeyDown={
            isInteractive
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSliceClick?.(index);
                  }
                }
              : undefined
          }
          tabIndex={isInteractive ? 0 : undefined}
          role={isInteractive ? "button" : undefined}
          aria-pressed={isInteractive ? slice.locked : undefined}
          aria-label={
            isInteractive
              ? slice.locked
                ? `Unlock colour ${slice.hex}`
                : `Lock colour ${slice.hex}`
              : undefined
          }
          className={
            isInteractive
              ? "focus:outline-none hover:scale-[1.05] focus-visible:scale-[1.05] transition-transform origin-center"
              : undefined
          }
          style={{
            cursor: isInteractive ? "pointer" : "default",
          }}
        />
      ))}
    </svg>
  );
}

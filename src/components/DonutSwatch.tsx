import type { Colour } from "../colour/types";
import { getSlicePath } from "./donut-geometry";
import { LockIcon } from "./icons"; // Import your existing LockIcon

const VIEWBOX_SIZE = 106; // Using the padded viewbox to prevent clipping

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
  const R = 50;
  const r = R * holeRatio;
  const sliceAngle = palette.length === 0 ? 0 : 360 / palette.length;

  const isInteractive = Boolean(onSliceClick);

  // Calculate the radius depth where the icon should sit (halfway between inner and outer edge)
  const iconRadius = r + (R - r) / 2;

  const slices = palette.map((colour, i) => {
    const startAngle = i * sliceAngle;
    const endAngle = (i + 1) * sliceAngle;

    // Calculate the midpoint angle of the current slice (in radians)
    const midAngleDegrees = startAngle + sliceAngle / 2;
    // Subtract 90 degrees because SVG arc math traditionally starts from the top (12 o'clock)
    const midAngleRadians = ((midAngleDegrees - 90) * Math.PI) / 180;

    // Trigonometry to find the exact X and Y center of this specific slice
    const iconX = cx + iconRadius * Math.cos(midAngleRadians);
    const iconY = cy + iconRadius * Math.sin(midAngleRadians);

    return {
      hex: colour.hex,
      pathData: getSlicePath(cx, cy, r, R, startAngle, endAngle),
      locked: colour.locked,
      iconX,
      iconY,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto max-w-375 aspect-square"
      role="img"
      aria-label="Colour palette donut chart"
    >
      {slices.map((slice, index) => (
        <g
          key={index}
          className="group origin-center"
          style={{ cursor: isInteractive ? "pointer" : "default" }}
          onClick={isInteractive ? () => onSliceClick?.(index) : undefined}
        >
          <path
            d={slice.pathData}
            fill={`#${slice.hex}`}
            strokeWidth={0}
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
                ? `${slice.locked ? "Unlock" : "Lock"} colour ${slice.hex}`
                : undefined
            }
            className={
              isInteractive
                ? "focus:outline-none group-hover:scale-[1.05] focus-visible:scale-[1.05] transition-transform duration-150 origin-center z-40"
                : undefined
            }
          />

          {slice.locked && (
            <g
              transform={`translate(${slice.iconX}, ${slice.iconY})`}
              className="pointer-events-none"
            >
              <circle r="4" fill="white" className="opacity-40 shadow-sm" />

              <g transform="translate(-2, -2)">
                <LockIcon width="4" height="4" className="text-slate-800" />
              </g>
            </g>
          )}
        </g>
      ))}
    </svg>
  );
}

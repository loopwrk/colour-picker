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
}

export function DonutSwatch({ palette, holeRatio = 0.42 }: DonutSwatchProps) {
  const cx = VIEWBOX_SIZE / 2;
  const cy = VIEWBOX_SIZE / 2;
  const R = VIEWBOX_SIZE / 2;
  const r = R * holeRatio;
  const sliceAngle = palette.length === 0 ? 0 : 360 / palette.length;

  const slices = palette.map((colour, i) => ({
    hex: colour.hex,
    pathData: getSlicePath(cx, cy, r, R, i * sliceAngle, (i + 1) * sliceAngle),
  }));

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto max-w-[1500px] aspect-square"
      role="img"
      aria-label="Colour palette donut chart"
    >
      {slices.map((slice, index) => (
        <path key={index} d={slice.pathData} fill={`#${slice.hex}`} />
      ))}
    </svg>
  );
}
/**
 * Convert polar coordinates (angle in degrees, radius) to Cartesian (x, y)
 * relative to a centre point.
 */
function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number,
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

/**
 * Build the SVG `d` string for one donut slice (an annular sector).
 */
export function getSlicePath(
  cx: number,
  cy: number,
  r: number,
  R: number,
  startAngle: number,
  endAngle: number,
): string {
  // Guard against a fully-closed circle collapsing into a zero-length arc.
  const safeEndAngle =
    endAngle - startAngle >= 360 ? startAngle + 359.99 : endAngle;

  const outerStart = polarToCartesian(cx, cy, R, startAngle);
  const outerEnd = polarToCartesian(cx, cy, R, safeEndAngle);
  const innerEnd = polarToCartesian(cx, cy, r, safeEndAngle);
  const innerStart = polarToCartesian(cx, cy, r, startAngle);

  const largeArcFlag = safeEndAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${R} ${R} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

/**
 * Compute the position for a label outside a donut slice. Returns the
 * label's centre as 2D coordinates (percentages of a square container).
 * `xPercent` is the horizontal offset from the container's left edge;
 * `yPercent` is the vertical offset from the top]].
 *
 * `radiusPercent` controls how far outside the donut the label sits.
 */
export function getLabelPosition(
  sliceIndex: number,
  sliceCount: number,
  radiusPercent: number,
): { xPercent: number; yPercent: number } {
  const sliceAngle = 360 / sliceCount;
  const centreAngleDeg = sliceIndex * sliceAngle;
  const angleRad = ((centreAngleDeg - 90) * Math.PI) / 180;
  return {
    xPercent: 50 + radiusPercent * Math.cos(angleRad),
    yPercent: 50 + radiusPercent * Math.sin(angleRad),
  };
}

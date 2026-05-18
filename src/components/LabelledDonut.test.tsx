import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LabelledDonut } from "./LabelledDonut";
import type { Colour, NamedColour } from "../colour/types";

function makePalette(hexes: string[]): Colour[] {
  return hexes.map((hex) => ({ hex, name: "", locked: false }));
}

function makeNames(
  entries: Array<{ hex: string; name: string }>,
): NamedColour[] {
  return entries.map(({ hex, name }) => ({
    hex,
    name,
    bestContrast: "black",
  }));
}

const FIVE_COLOURS = makePalette([
  "FF0000",
  "00FF00",
  "0000FF",
  "FFFF00",
  "FF00FF",
]);

const FIVE_NAMES = makeNames([
  { hex: "FF0000", name: "Pure Red" },
  { hex: "00FF00", name: "Pure Green" },
  { hex: "0000FF", name: "Pure Blue" },
  { hex: "FFFF00", name: "Pure Yellow" },
  { hex: "FF00FF", name: "Pure Magenta" },
]);

describe("LabelledDonut", () => {
  it("renders the inner DonutSwatch", () => {
    render(<LabelledDonut palette={FIVE_COLOURS} />);
    expect(
      screen.getByRole("img", { name: /colour palette/i }),
    ).toBeInTheDocument();
  });

  it("renders each label's zero-padded index", () => {
    render(<LabelledDonut palette={FIVE_COLOURS} />);
    ["01", "02", "03", "04", "05"].forEach((expected) => {
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  it("renders each colour's hex code", () => {
    render(<LabelledDonut palette={FIVE_COLOURS} />);
    FIVE_COLOURS.forEach((colour) => {
      expect(screen.getByText(colour.hex)).toBeInTheDocument();
    });
  });

  it("renders the colour names when the names prop is provided", () => {
    render(<LabelledDonut palette={FIVE_COLOURS} names={FIVE_NAMES} />);
    FIVE_NAMES.forEach((named) => {
      expect(screen.getByText(named.name)).toBeInTheDocument();
    });
  });

  it("does not render any names when the names prop is omitted", () => {
    render(<LabelledDonut palette={FIVE_COLOURS} />);
    FIVE_NAMES.forEach((named) => {
      expect(screen.queryByText(named.name)).not.toBeInTheDocument();
    });
  });

  it("renders nothing label-related for an empty palette", () => {
    render(<LabelledDonut palette={[]} />);
    expect(screen.queryByText("01")).not.toBeInTheDocument();
    // Donut still renders (an empty SVG), so the role is still present.
    expect(
      screen.getByRole("img", { name: /colour palette/i }),
    ).toBeInTheDocument();
  });

  it("forwards onSliceClick down to the inner donut", async () => {
    const onSliceClick = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <LabelledDonut palette={FIVE_COLOURS} onSliceClick={onSliceClick} />,
    );
    const paths = container.querySelectorAll("path");
    await user.click(paths[3]);
    expect(onSliceClick).toHaveBeenCalledWith(3);
  });

  it("does not render lock indicators in unlocked labels", () => {
    const { container } = render(<LabelledDonut palette={FIVE_COLOURS} />);
    // Lock indicator is an SVG inside a label. The donut itself is one
    // SVG; if no labels are locked, the donut should be the only SVG.
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("renders a lock indicator in each locked label", () => {
    const mixed: Colour[] = [
      { hex: "FF0000", name: "", locked: true },
      { hex: "00FF00", name: "", locked: false },
      { hex: "0000FF", name: "", locked: true },
    ];
    const { container } = render(<LabelledDonut palette={mixed} />);
    // 1 donut SVG + 2 lock SVGs in the locked labels = 3.
    expect(container.querySelectorAll("svg")).toHaveLength(3);
  });
});

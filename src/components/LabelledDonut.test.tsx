import { render, screen } from "@testing-library/react";

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
});

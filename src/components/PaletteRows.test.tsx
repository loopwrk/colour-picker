import { render, screen } from "@testing-library/react";

import { PaletteRows } from "./PaletteRows.tsx";
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

describe("PaletteRows", () => {
  it("renders one row per palette entry", () => {
    const { container } = render(<PaletteRows palette={FIVE_COLOURS} />);
    expect(container.querySelectorAll("li")).toHaveLength(5);
  });

  it("renders nothing for an empty palette (but doesn't crash)", () => {
    const { container } = render(<PaletteRows palette={[]} />);
    expect(container.querySelectorAll("li")).toHaveLength(0);
  });

  it("renders each colour's hex code", () => {
    render(<PaletteRows palette={FIVE_COLOURS} />);
    FIVE_COLOURS.forEach((colour) => {
      expect(screen.getByText(colour.hex)).toBeInTheDocument();
    });
  });

  it("renders the colour names when the names prop is provided", () => {
    render(<PaletteRows palette={FIVE_COLOURS} names={FIVE_NAMES} />);
    FIVE_NAMES.forEach((named) => {
      expect(screen.getByText(named.name)).toBeInTheDocument();
    });
  });

  it("does not render any names when the names prop is omitted", () => {
    render(<PaletteRows palette={FIVE_COLOURS} />);
    FIVE_NAMES.forEach((named) => {
      expect(screen.queryByText(named.name)).not.toBeInTheDocument();
    });
  });

  it("paints each row's swatch from the colour's hex", () => {
    const { container } = render(<PaletteRows palette={FIVE_COLOURS} />);
    // jsdom normalises inline `background-color: #RRGGBB` to its
    // `rgb(r, g, b)` form, so we compare against that rather than the
    // original hex string.
    const swatches = container.querySelectorAll("li > span:first-child");
    expect(swatches).toHaveLength(5);
    swatches.forEach((el, i) => {
      const hex = FIVE_COLOURS[i].hex;
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      expect((el as HTMLElement).style.backgroundColor).toBe(
        `rgb(${r}, ${g}, ${b})`,
      );
    });
  });

  it("forwards an extra className to the outer list", () => {
    const { container } = render(
      <PaletteRows palette={FIVE_COLOURS} className="md:hidden" />,
    );
    expect(container.querySelector("ul")?.className).toContain("md:hidden");
  });
});
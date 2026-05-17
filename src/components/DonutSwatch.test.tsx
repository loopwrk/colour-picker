import { render, screen } from "@testing-library/react";

import { DonutSwatch } from "./DonutSwatch";
import type { Colour } from "../colour/types";

/**
 * Build a Colour[] fixture from a list of hex strings. Keeps the test
 * bodies focused on what's being asserted rather than the `name`/`locked`
 * boilerplate.
 */
function makePalette(hexes: string[]): Colour[] {
  return hexes.map((hex) => ({ hex, name: "", locked: false }));
}

const FIVE_COLOURS = makePalette([
  "FF0000",
  "00FF00",
  "0000FF",
  "FFFF00",
  "FF00FF",
]);

describe("DonutSwatch", () => {
  it("renders an SVG element", () => {
    const { container } = render(<DonutSwatch palette={FIVE_COLOURS} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders one path per palette entry", () => {
    const { container } = render(<DonutSwatch palette={FIVE_COLOURS} />);
    expect(container.querySelectorAll("path")).toHaveLength(5);
  });

  it("scales path count to the palette size", () => {
    const { container, rerender } = render(
      <DonutSwatch palette={makePalette(["FF0000", "00FF00", "0000FF"])} />,
    );
    expect(container.querySelectorAll("path")).toHaveLength(3);

    rerender(
      <DonutSwatch
        palette={makePalette([
          "FF0000",
          "00FF00",
          "0000FF",
          "FFFF00",
          "FF00FF",
          "00FFFF",
          "808080",
        ])}
      />,
    );
    expect(container.querySelectorAll("path")).toHaveLength(7);
  });

  it("renders nothing (but doesn't crash) for an empty palette", () => {
    const { container } = render(<DonutSwatch palette={[]} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll("path")).toHaveLength(0);
  });

  it("sets each path's fill to '#' plus the palette hex", () => {
    const { container } = render(<DonutSwatch palette={FIVE_COLOURS} />);
    const paths = Array.from(container.querySelectorAll("path"));
    const fills = paths.map((p) => p.getAttribute("fill"));
    expect(fills).toEqual([
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
    ]);
  });

  it("uses the documented 0 0 100 100 viewBox", () => {
    const { container } = render(<DonutSwatch palette={FIVE_COLOURS} />);
    expect(container.querySelector("svg")?.getAttribute("viewBox")).toBe(
      "0 0 100 100",
    );
  });

  it("respects a custom holeRatio prop", () => {
    // Asserting exact path strings would just be the geometry helper
    // tested twice, and would be brittle to refactoring. We just verify
    // that the prop reaches the geometry — two different holeRatios
    // must produce different `d` attributes for the same slice.
    const { container: defaults } = render(
      <DonutSwatch palette={FIVE_COLOURS} />,
    );
    const { container: tweaked } = render(
      <DonutSwatch palette={FIVE_COLOURS} holeRatio={0.7} />,
    );
    const defaultD = defaults.querySelectorAll("path")[0].getAttribute("d");
    const tweakedD = tweaked.querySelectorAll("path")[0].getAttribute("d");
    expect(defaultD).not.toBe(tweakedD);
  });

  it("exposes itself as a labelled image to screen readers", () => {
    render(<DonutSwatch palette={FIVE_COLOURS} />);
    expect(
      screen.getByRole("img", { name: /colour palette/i }),
    ).toBeInTheDocument();
  });
});

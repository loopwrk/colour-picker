import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

  it("calls onSliceClick with the clicked slice's index", async () => {
    const onSliceClick = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <DonutSwatch palette={FIVE_COLOURS} onSliceClick={onSliceClick} />,
    );
    const paths = container.querySelectorAll("path");
    await user.click(paths[2]);
    expect(onSliceClick).toHaveBeenCalledTimes(1);
    expect(onSliceClick).toHaveBeenCalledWith(2);
  });

  it("renders no stroke on unlocked slices", () => {
    const { container } = render(<DonutSwatch palette={FIVE_COLOURS} />);
    container.querySelectorAll("path").forEach((path) => {
      // strokeWidth attribute is "0" on unlocked slices (which is also
      // CSS-equivalent to no stroke).
      expect(path.getAttribute("stroke-width")).toBe("0");
    });
  });

  it("renders a visible stroke on locked slices only", () => {
    const mixed: Colour[] = [
      { hex: "FF0000", name: "", locked: true },
      { hex: "00FF00", name: "", locked: false },
      { hex: "0000FF", name: "", locked: true },
    ];
    const { container } = render(<DonutSwatch palette={mixed} />);
    const paths = Array.from(container.querySelectorAll("path"));
    expect(paths[0].getAttribute("stroke-width")).toBe("1.5");
    expect(paths[1].getAttribute("stroke-width")).toBe("0");
    expect(paths[2].getAttribute("stroke-width")).toBe("1.5");
  });

  describe("when interactive (onSliceClick provided)", () => {
    it("exposes each slice as a toggle button to assistive tech", () => {
      const { container } = render(
        <DonutSwatch palette={FIVE_COLOURS} onSliceClick={() => {}} />,
      );
      const paths = Array.from(container.querySelectorAll("path"));
      paths.forEach((path, i) => {
        expect(path.getAttribute("role")).toBe("button");
        expect(path.getAttribute("tabindex")).toBe("0");
        expect(path.getAttribute("aria-pressed")).toBe("false");
        expect(path.getAttribute("aria-label")).toBe(
          `Lock colour ${FIVE_COLOURS[i].hex}`,
        );
      });
    });

    it("inverts aria-pressed and aria-label on locked slices", () => {
      const mixed: Colour[] = [
        { hex: "FF0000", name: "", locked: true },
        { hex: "00FF00", name: "", locked: false },
      ];
      const { container } = render(
        <DonutSwatch palette={mixed} onSliceClick={() => {}} />,
      );
      const paths = Array.from(container.querySelectorAll("path"));
      expect(paths[0].getAttribute("aria-pressed")).toBe("true");
      expect(paths[0].getAttribute("aria-label")).toBe(
        "Unlock colour FF0000",
      );
      expect(paths[1].getAttribute("aria-pressed")).toBe("false");
      expect(paths[1].getAttribute("aria-label")).toBe(
        "Lock colour 00FF00",
      );
    });

    it("activates a focused slice on Enter", async () => {
      const onSliceClick = vi.fn();
      const user = userEvent.setup();
      render(
        <DonutSwatch palette={FIVE_COLOURS} onSliceClick={onSliceClick} />,
      );
      const slice = screen.getByRole("button", {
        name: /Lock colour 0000FF/i,
      });
      slice.focus();
      await user.keyboard("{Enter}");
      expect(onSliceClick).toHaveBeenCalledTimes(1);
      expect(onSliceClick).toHaveBeenCalledWith(2);
    });

    it("activates a focused slice on Space", async () => {
      const onSliceClick = vi.fn();
      const user = userEvent.setup();
      render(
        <DonutSwatch palette={FIVE_COLOURS} onSliceClick={onSliceClick} />,
      );
      const slice = screen.getByRole("button", {
        name: /Lock colour FF0000/i,
      });
      slice.focus();
      await user.keyboard(" ");
      expect(onSliceClick).toHaveBeenCalledTimes(1);
      expect(onSliceClick).toHaveBeenCalledWith(0);
    });

    it("ignores other keys on a focused slice", async () => {
      const onSliceClick = vi.fn();
      const user = userEvent.setup();
      render(
        <DonutSwatch palette={FIVE_COLOURS} onSliceClick={onSliceClick} />,
      );
      const slice = screen.getByRole("button", {
        name: /Lock colour FF0000/i,
      });
      slice.focus();
      await user.keyboard("a");
      await user.keyboard("{ArrowRight}");
      expect(onSliceClick).not.toHaveBeenCalled();
    });
  });

  describe("when non-interactive (no onSliceClick)", () => {
    it("does not add button semantics to the slices", () => {
      const { container } = render(<DonutSwatch palette={FIVE_COLOURS} />);
      container.querySelectorAll("path").forEach((path) => {
        expect(path.getAttribute("role")).toBeNull();
        expect(path.getAttribute("tabindex")).toBeNull();
        expect(path.getAttribute("aria-pressed")).toBeNull();
        expect(path.getAttribute("aria-label")).toBeNull();
      });
    });
  });
});

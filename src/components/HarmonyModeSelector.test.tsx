import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HarmonyModeSelector } from "./HarmonyModeSelector.tsx";
import { HARMONY_MODES } from "../colour/harmony";

describe("HarmonyModeSelector", () => {
  it("renders as a radiogroup labelled 'Harmony mode'", () => {
    render(
      <HarmonyModeSelector
        mode="split-complementary"
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole("radiogroup", { name: /harmony mode/i }),
    ).toBeInTheDocument();
  });

  it("renders one radio per harmony mode", () => {
    render(
      <HarmonyModeSelector mode="split-complementary" onChange={() => {}} />,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(HARMONY_MODES.length);
  });

  it("marks the active mode with aria-checked=true and the rest with false", () => {
    render(<HarmonyModeSelector mode="triad" onChange={() => {}} />);

    const triad = screen.getByRole("radio", { name: /^triad$/i });
    expect(triad).toHaveAttribute("aria-checked", "true");

    // Spot-check a couple of others to confirm they're unchecked.
    expect(
      screen.getByRole("radio", { name: /^square$/i }),
    ).toHaveAttribute("aria-checked", "false");
    expect(
      screen.getByRole("radio", { name: /^split complementary$/i }),
    ).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange with the clicked mode", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <HarmonyModeSelector
        mode="split-complementary"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("radio", { name: /^shades$/i }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("shades");
  });

  it("still calls onChange when the already-active mode is clicked", async () => {
    // The selector is a controlled component — it doesn't suppress
    // 'clicked while already active'. Whether to ignore the click (or
    // re-roll the palette) is App.tsx's decision.
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<HarmonyModeSelector mode="triad" onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: /^triad$/i }));
    expect(onChange).toHaveBeenCalledWith("triad");
  });

  it("forwards an extra className to the outer radiogroup", () => {
    render(
      <HarmonyModeSelector
        mode="split-complementary"
        onChange={() => {}}
        className="md:hidden"
      />,
    );
    expect(screen.getByRole("radiogroup").className).toContain("md:hidden");
  });

  it("renders translated labels rather than raw i18n keys", () => {
    // Guard against an i18n misconfiguration where the t() call would
    // return the literal key "app.harmony.modes.triad" — that should
    // never be visible to the user.
    render(
      <HarmonyModeSelector mode="split-complementary" onChange={() => {}} />,
    );
    expect(
      screen.queryByRole("radio", { name: /app\.harmony\.modes/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /^monochromatic$/i }),
    ).toBeInTheDocument();
  });
});

import { useState } from "react";
import { RgbaColorPicker, type RgbaColor } from "react-colorful";
import { Button } from "flowbite-react";
import { useTranslation } from "react-i18next";
import { formatHex } from "culori";
import "./ColourPicker.css";

interface ColourPickerProps {
  value?: string | null;
  onApply: (hex: string) => void;
  className?: string;
}

const DEFAULT_RGBA: RgbaColor = { r: 0, g: 122, b: 255, a: 1 };

/**
 * Standalone colour picker built on react-colorful's RgbaColorPicker.

 * The picker is RGBA under the hood but the alpha slider is currently
 * hidden via CSS. The project's palette model is hex-only for now.
 * Re-enable the slider by removing the `__alpha:hidden` rule in
 * ColourPicker.css, and ensure the onApply handler converts RGBA to hex.
 */
export function ColourPicker({ onApply, className = "" }: ColourPickerProps) {
  const { t } = useTranslation();
  const [colour, setColour] = useState<RgbaColor>(DEFAULT_RGBA);

  const handleApply = () => {
    const hex = formatHex({
      mode: "rgb",
      r: colour.r / 255,
      g: colour.g / 255,
      b: colour.b / 255,
    });
    if (!hex) return;
    // Strip leading #, uppercase — matches the project's Colour.hex shape.
    onApply(hex.slice(1).toUpperCase());
  };

  // Preview swatch uses rgba so the alpha shows visually.
  const previewBg = `rgba(${colour.r}, ${colour.g}, ${colour.b}, ${colour.a})`;

  return (
    <div className={`flex flex-col gap-5 ${className}`}>
      <div className="colour-picker mb-4">
        <RgbaColorPicker color={colour} onChange={setColour} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-3">
          <div
            className="h-20 rounded-lg"
            style={{ backgroundColor: previewBg }}
            aria-label={t("app.picker.selectedColour")}
          />
          <Button onClick={handleApply} color="dark" size="lg" className="h-20">
            {t("app.picker.apply")}
          </Button>
        </div>
      </div>
    </div>
  );
}

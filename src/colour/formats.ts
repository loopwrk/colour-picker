import type { OutputFormat } from "./export";

export function formatPalette(colours: string[], format: OutputFormat): string {
  switch (format) {
    case "css-variables":
      return cssVariables(colours);
    case "design-tokens":
      return designTokens(colours);
    case "tailwind":
      return tailwindTheme(colours);
    case "json":
      return jsonObject(colours);
    case "array":
      return arrayLiteral(colours);
  }
}

function cssVariables(colours: string[]): string {
  const lines = colours.map((c, i) => `  --color-${i + 1}: ${c};`).join("\n");
  return `:root {\n${lines}\n}`;
}

function designTokens(colours: string[]): string {
  const entries: Record<string, { $value: string; $type: "color" }> = {};
  colours.forEach((c, i) => {
    entries[String(i + 1)] = { $value: c, $type: "color" };
  });
  return JSON.stringify({ color: entries }, null, 2);
}

function tailwindTheme(colours: string[]): string {
  const lines = colours
    .map((c, i) => `  --color-palette-${i + 1}: ${c};`)
    .join("\n");
  return `@theme {\n${lines}\n}`;
}

function jsonObject(colours: string[]): string {
  const obj: Record<string, string> = {};
  colours.forEach((c, i) => {
    obj[`color-${i + 1}`] = c;
  });
  return JSON.stringify(obj, null, 2);
}

function arrayLiteral(colours: string[]): string {
  return JSON.stringify(colours, null, 2);
}

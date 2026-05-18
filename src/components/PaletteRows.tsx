import type { Colour, NamedColour } from "../colour/types";

import { LockIcon, UnlockIcon } from "./icons";

interface PaletteRowsProps {
  palette: Colour[];
  names?: NamedColour[];
  onLockToggle?: (index: number) => void;
  className?: string;
}

export function PaletteRows({
  palette,
  names,
  onLockToggle,
  className = "",
}: PaletteRowsProps) {
  return (
    <ul className={`flex flex-col gap-2 ${className}`}>
      {palette.map((colour, index) => (
        <li
          key={index}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-200/60 dark:bg-slate-800/60"
        >
          <span
            className="w-8 h-8 rounded shrink-0"
            style={{ backgroundColor: `#${colour.hex}` }}
            aria-hidden="true"
          />
          <span className="font-mono text-base text-slate-900 dark:text-slate-100">
            {colour.hex}
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 flex-1 truncate">
            {names?.[index]?.name ?? ""}
          </span>
          <button
            type="button"
            onClick={() => onLockToggle?.(index)}
            aria-pressed={colour.locked}
            aria-label={
              colour.locked
                ? `Unlock colour ${colour.hex}`
                : `Lock colour ${colour.hex}`
            }
            className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shrink-0 p-1 -m-1 rounded"
          >
            {colour.locked ? <LockIcon /> : null}
          </button>
        </li>
      ))}
    </ul>
  );
}

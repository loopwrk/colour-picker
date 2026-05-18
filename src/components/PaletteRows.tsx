import type { Colour, NamedColour } from "../colour/types";

interface PaletteRowsProps {
  palette: Colour[];
  names?: NamedColour[];
  className?: string;
}

export function PaletteRows({
  palette,
  names,
  className = "",
}: PaletteRowsProps) {
  return (
    <ul className={`flex flex-col gap-2 ${className}`}>
        {
            palette.map((colour, index) => (
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
                    <UnlockedIcon className="text-slate-400 dark:text-slate-500 shrink-0" />
                </li>
            ))
        }
    </ul>
  );
}

function UnlockedIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}


import { useTranslation } from "react-i18next";

import { HARMONY_MODES, type HarmonyMode } from "../colour/harmony";

interface HarmonyModeSelectorProps {
  mode: HarmonyMode;
  onChange: (mode: HarmonyMode) => void;
  className?: string;
}

export function HarmonyModeSelector({
  mode,
  onChange,
  className = "",
}: HarmonyModeSelectorProps) {
  const { t } = useTranslation();

  return (
    // RadioGroup chosen for screen readers
    <div
      role="radiogroup"
      aria-label={t("app.harmony.label")}
      className={`flex flex-wrap justify-center gap-2 ${className}`}
    >
      {HARMONY_MODES.map((m) => {
        const isActive = m === mode;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(m)}
            className={
              "px-3 py-1.5 text-sm rounded-full transition-colors " +
              (isActive
                ? "bg-slate-900 text-slate-100 dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700")
            }
          >
            {t(`app.harmony.modes.${m}`)}
          </button>
        );
      })}
    </div>
  );
}

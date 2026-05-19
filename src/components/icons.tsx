import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

export function LockIcon({ className, width, height, ...props }: IconProps) {
  const defaultClasses = width || height ? "" : "w-5 h-5";

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      height={height}
      className={`${defaultClasses} ${className ?? ""}`.trim()}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function UnlockIcon({ className, width, height, ...props }: IconProps) {
  const defaultClasses = width || height ? "" : "w-5 h-5";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      height={height}
      className={`${defaultClasses} ${className ?? ""}`.trim()}
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

export function SunIcon({ className, width, height, ...props }: IconProps) {
  const defaultClasses = width || height ? "" : "w-5 h-5";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      height={height}
      className={`${defaultClasses} ${className ?? ""}`.trim()}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

export function MoonIcon({ className, width, height, ...props }: IconProps) {
  const defaultClasses = width || height ? "" : "w-5 h-5";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      height={height}
      className={`${defaultClasses} ${className ?? ""}`.trim()}
      aria-hidden="true"
      {...props}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function CopyIcon({ className, width, height, ...props }: IconProps) {
  const defaultClasses = width || height ? "" : "w-5 h-5";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      height={height}
      className={`${defaultClasses} ${className ?? ""}`.trim()}
      aria-hidden="true"
      {...props}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function CheckIcon({ className, width, height, ...props }: IconProps) {
  const defaultClasses = width || height ? "" : "w-5 h-5";
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      height={height}
      className={`${defaultClasses} ${className ?? ""}`.trim()}
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

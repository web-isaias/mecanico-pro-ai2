"use client";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mp-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a1628" />
          <stop offset="100%" stopColor="#1a2f4f" />
        </linearGradient>
        <linearGradient id="mp-or" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff9a4d" />
          <stop offset="100%" stopColor="#f56a00" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#mp-bg)" />
      <g fill="url(#mp-or)">
        <path d="M32 14 L34.5 14 L35.2 19.2 L39.5 20.8 L43.5 17.8 L46.2 20.5 L43.2 24.5 L44.8 28.8 L50 29.5 L50 32 L50 34.5 L44.8 35.2 L43.2 39.5 L46.2 43.5 L43.5 46.2 L39.5 43.2 L35.2 44.8 L34.5 50 L32 50 L29.5 50 L28.8 44.8 L24.5 43.2 L20.5 46.2 L17.8 43.5 L20.8 39.5 L19.2 35.2 L14 34.5 L14 32 L14 29.5 L19.2 28.8 L20.8 24.5 L17.8 20.5 L20.5 17.8 L24.5 20.8 L28.8 19.2 L29.5 14 Z" />
        <circle cx="32" cy="32" r="8" fill="#0a1628" />
      </g>
      <path
        d="M32 27 L33 30 L36 31 L33 32 L32 35 L31 32 L28 31 L31 30 Z"
        fill="#ffd9a8"
      />
    </svg>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <BrandLogo size={36} />
      <div className="flex flex-col leading-none">
        <span className="text-sm font-bold tracking-tight text-foreground">
          Mecânico <span className="text-gradient-orange">Pro AI</span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Assistente Técnico
        </span>
      </div>
    </div>
  );
}

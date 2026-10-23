import type { CSSProperties } from "react";

/**
 * Fond d'ambiance : trois halos flous qui dérivent lentement.
 * Les couleurs suivent la palette choisie (transition douce).
 */
export function AmbientBackground({
  palette,
  intensity = 1,
}: {
  palette?: readonly string[];
  intensity?: number;
}) {
  const style = palette
    ? ({
        "--amb-1": palette[1],
        "--amb-2": palette[2],
        "--amb-3": palette[0],
      } as CSSProperties)
    : undefined;

  return (
    <div
      aria-hidden
      style={style}
      className="pointer-events-none fixed inset-0 -z-0 overflow-hidden"
    >
      <div
        className="animate-drift absolute -left-[20%] -top-[25%] h-[75vmax] w-[75vmax] rounded-full blur-[110px] transition-[background-color] duration-[2000ms]"
        style={{ backgroundColor: "var(--amb-1)", opacity: 0.55 * intensity }}
      />
      <div
        className="animate-drift absolute -bottom-[30%] -right-[15%] h-[70vmax] w-[70vmax] rounded-full blur-[120px] transition-[background-color] duration-[2000ms]"
        style={{
          backgroundColor: "var(--amb-2)",
          opacity: 0.4 * intensity,
          animationDelay: "-9s",
          animationDuration: "34s",
        }}
      />
      <div
        className="animate-drift absolute left-[30%] top-[35%] h-[40vmax] w-[40vmax] rounded-full blur-[100px] transition-[background-color] duration-[2000ms]"
        style={{
          backgroundColor: "var(--amb-3)",
          opacity: 0.35 * intensity,
          animationDelay: "-17s",
          animationDuration: "40s",
        }}
      />
      {/* Grain discret pour éviter l'aspect numérique trop lisse. */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay">
        <filter id="ambient-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ambient-grain)" />
      </svg>
    </div>
  );
}

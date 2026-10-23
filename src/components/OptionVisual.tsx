import { useId } from "react";
import { findColor, type CategoryId } from "@/lib/options";

/**
 * Petites vignettes abstraites qui accompagnent chaque choix.
 * Elles suggèrent une sensation plutôt qu'elles n'illustrent un mot.
 */
export function OptionVisual({ category, id }: { category: CategoryId; id: string }) {
  switch (category) {
    case "shape":
      return <ShapeGlyph id={id} />;
    case "color":
      return <ColorSwatch id={id} />;
    case "texture":
      return <TextureSwatch id={id} />;
    case "atmosphere":
      return <AtmosphereGlyph id={id} />;
    default:
      return null;
  }
}

const svgProps = {
  viewBox: "0 0 64 64",
  className: "h-full w-full",
  "aria-hidden": true,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function ShapeGlyph({ id }: { id: string }) {
  switch (id) {
    case "silhouette":
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="18" r="6" fill="currentColor" fillOpacity="0.25" />
          <path d="M22 54 L24 33 C25 27 28 25 32 25 C36 25 39 27 40 33 L42 54" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );
    case "vide":
      return (
        <svg {...svgProps}>
          <rect x="12" y="12" width="40" height="40" strokeOpacity="0.4" />
          <circle cx="36" cy="40" r="1.3" fill="currentColor" />
        </svg>
      );
    case "fils":
      return (
        <svg {...svgProps}>
          <path d="M8 20 C24 4 30 44 44 22 S58 40 50 50" />
          <path d="M10 44 C20 30 40 56 46 30 S28 10 54 14" strokeOpacity="0.6" />
          <path d="M14 10 C34 26 18 40 36 50" strokeOpacity="0.4" />
        </svg>
      );
    case "lumiere":
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="28" r="16" fill="currentColor" fillOpacity="0.18" stroke="none" />
          <circle cx="32" cy="28" r="8" fill="currentColor" fillOpacity="0.35" stroke="none" />
          <path d="M14 46 C18 34 46 32 50 46 C46 56 18 56 14 46 Z" fill="var(--ink)" />
        </svg>
      );
    case "porte":
      return (
        <svg {...svgProps}>
          <rect x="20" y="10" width="24" height="44" />
          <path d="M44 11 V53" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.5" />
          <path d="M16 56 H48" strokeOpacity="0.6" />
          <circle cx="38" cy="33" r="1.2" fill="currentColor" />
        </svg>
      );
    case "transformation":
      return (
        <svg {...svgProps}>
          <path d="M14 32 C14 20 30 16 34 26 C38 34 30 46 22 44 C16 43 14 38 14 32 Z" fill="currentColor" fillOpacity="0.15" />
          <circle cx="42" cy="28" r="2.4" fill="currentColor" fillOpacity="0.7" stroke="none" />
          <circle cx="48" cy="36" r="1.7" fill="currentColor" fillOpacity="0.5" stroke="none" />
          <circle cx="53" cy="27" r="1.1" fill="currentColor" fillOpacity="0.4" stroke="none" />
        </svg>
      );
    case "fragments":
      return (
        <svg {...svgProps}>
          <path d="M28 26 L36 24 L33 32 Z" fill="currentColor" fillOpacity="0.3" />
          <path d="M14 16 L20 14 L18 22 Z" />
          <path d="M44 14 L50 18 L45 21 Z" />
          <path d="M46 42 L54 44 L48 50 Z" fill="currentColor" fillOpacity="0.2" />
          <path d="M12 44 L18 40 L19 48 Z" />
        </svg>
      );
    default:
      return null;
  }
}

function ColorSwatch({ id }: { id: string }) {
  const color = findColor(id);
  if (!color) return null;
  const [a, b, c, d] = color.palette;
  const background =
    id === "libre"
      ? `conic-gradient(from 40deg, ${a}, ${b}, ${c}, ${d}, ${a})`
      : `radial-gradient(circle at 35% 30%, ${d} 0%, ${c} 28%, ${b} 62%, ${a} 100%)`;
  return (
    <span
      aria-hidden
      className="block h-full w-full rounded-full shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]"
      style={{ background }}
    />
  );
}

function TextureSwatch({ id }: { id: string }) {
  const fid = useId().replace(/:/g, "");
  const filters: Record<string, React.ReactNode> = {
    brume: (
      <filter id={fid}>
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="3" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0 0.9  0 0 0 1.2 -0.35" />
        <feGaussianBlur stdDeviation="2.5" />
      </filter>
    ),
    verre: null,
    eau: (
      <filter id={fid}>
        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.18" numOctaves="2" seed="5" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.7  0 0 0 0 0.95  0 0 0 1.6 -0.55" />
      </filter>
    ),
    papier: (
      <filter id={fid}>
        <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="4" seed="2" result="n" />
        <feDiffuseLighting in="n" lightingColor="#e8e2d6" surfaceScale="2.2">
          <feDistantLight azimuth="45" elevation="50" />
        </feDiffuseLighting>
      </filter>
    ),
    doux: (
      <filter id={fid}>
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="8" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.7  0 0 0 0 0.85  0 0 0 0.9 -0.1" />
        <feGaussianBlur stdDeviation="4" />
      </filter>
    ),
    pierre: (
      <filter id={fid}>
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="4" />
        <feColorMatrix type="matrix" values="0.3 0.3 0.3 0 0.15  0.3 0.3 0.3 0 0.14  0.3 0.3 0.3 0 0.13  0 0 0 0 1" />
      </filter>
    ),
    fluide: (
      <filter id={fid}>
        <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="2" seed="11" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.75  0 0 0 0 0.6  0 0 0 0 0.95  0 0 0 2 -0.6" />
      </filter>
    ),
  };

  return (
    <svg viewBox="0 0 64 64" className="h-full w-full rounded-full" aria-hidden>
      <defs>
        {filters[id]}
        <clipPath id={`${fid}-clip`}>
          <circle cx="32" cy="32" r="31" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${fid}-clip)`}>
        <rect width="64" height="64" fill="#1c1a22" />
        {id === "verre" ? (
          <g stroke="#e6ecff" strokeOpacity="0.7" strokeWidth="0.7" fill="none">
            <rect width="64" height="64" fill="#9fb3d9" fillOpacity="0.12" />
            <path d="M30 30 L12 8 M30 30 L58 18 M30 30 L46 60 M30 30 L4 42 M30 30 L36 2 M30 30 L62 44" />
            <path d="M20 18 L24 34 L40 40 L48 24 Z" strokeOpacity="0.4" />
          </g>
        ) : (
          <rect width="64" height="64" filter={`url(#${fid})`} />
        )}
      </g>
      <circle cx="32" cy="32" r="31" fill="none" stroke="white" strokeOpacity="0.12" />
    </svg>
  );
}

function AtmosphereGlyph({ id }: { id: string }) {
  switch (id) {
    case "silence":
      return (
        <svg {...svgProps}>
          <path d="M10 32 H54" strokeOpacity="0.35" />
          <circle cx="32" cy="32" r="2" fill="currentColor" />
        </svg>
      );
    case "distance":
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="32" r="3" fill="currentColor" fillOpacity="0.8" />
          <circle cx="52" cy="32" r="3" fill="currentColor" fillOpacity="0.3" />
          <path d="M18 32 H46" strokeDasharray="1 4" strokeOpacity="0.4" />
        </svg>
      );
    case "mouvement":
      return (
        <svg {...svgProps}>
          <g className="animate-slide">
            <path d="M10 24 C22 18 32 30 54 22" />
            <path d="M10 34 C24 28 34 40 54 32" strokeOpacity="0.6" />
            <path d="M10 44 C26 38 36 50 54 42" strokeOpacity="0.3" />
          </g>
        </svg>
      );
    case "fragilite":
      return (
        <svg {...svgProps} strokeWidth={0.8}>
          <circle cx="32" cy="32" r="18" strokeDasharray="2 3" />
          <path d="M32 14 L30 24 L35 30" strokeOpacity="0.6" />
        </svg>
      );
    case "legerete":
      return (
        <svg {...svgProps}>
          <g className="animate-float">
            <circle cx="22" cy="40" r="2" fill="currentColor" fillOpacity="0.4" />
            <circle cx="32" cy="28" r="3" fill="currentColor" fillOpacity="0.7" />
            <circle cx="42" cy="18" r="1.5" fill="currentColor" fillOpacity="0.5" />
            <circle cx="44" cy="38" r="1.2" fill="currentColor" fillOpacity="0.3" />
          </g>
        </svg>
      );
    case "tension":
      return (
        <svg {...svgProps}>
          <path d="M10 32 H29" strokeWidth="2.2" />
          <path d="M35 32 H54" strokeWidth="2.2" />
          <path d="M29 26 V38 M35 26 V38" strokeOpacity="0.6" />
        </svg>
      );
    case "ouverture":
      return (
        <svg {...svgProps}>
          <path d="M14 12 V52 M50 12 V52" strokeOpacity="0.5" />
          <path d="M28 12 L18 52 H46 L36 12 Z" fill="currentColor" fillOpacity="0.15" stroke="none" />
        </svg>
      );
    default:
      return null;
  }
}

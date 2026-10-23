import { findColor } from "../options";
import { createRng, type Rng } from "../rng";
import type { GenerationRequest } from "../selection";
import type { ImageProvider } from "./types";

/**
 * Mode démonstration : aucune IA n'est appelée.
 *
 * Une composition abstraite est dessinée en SVG de manière procédurale à
 * partir des choix (forme, couleur, matière, atmosphère, composition,
 * ajustements). Chaque création est différente, mais ce n'est PAS une image
 * générée par IA : l'interface l'indique clairement.
 */
export function createDemoProvider(): ImageProvider {
  return {
    id: "demo",
    isDemo: true,
    async generate({ request }) {
      const svg = renderDemoSvg(request);
      return {
        base64: Buffer.from(svg, "utf8").toString("base64"),
        mimeType: "image/svg+xml",
      };
    },
  };
}

const SIZE = 1024;
const NEUTRAL: [string, string, string, string] = [
  "#0f1115",
  "#2a2f38",
  "#7a8594",
  "#dfe3e8",
];

const r1 = (v: number) => Math.round(v * 10) / 10;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const c = (x: number, y: number) =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${c(ar, br)}${c(ag, bg)}${c(ab, bb)}`;
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

interface Palette {
  bgTop: string;
  bgBottom: string;
  subject: string;
  accent: string;
  shadow: string;
  light: boolean;
}

function buildPalette(colorId: string | null, rng: Rng): Palette {
  const base = findColor(colorId)?.palette ?? NEUTRAL;
  let p = [...base];
  if (colorId === "libre") {
    // Palette libre : légère rotation aléatoire de l'ordre des teintes.
    const shift = rng.int(0, 1);
    if (shift) p = [p[0], p[2], p[1], p[3]];
  }
  const light = luminance(p[0]) > 0.5;
  if (light) {
    return {
      bgTop: p[3],
      bgBottom: p[1],
      subject: mix(p[0], "#1a1a22", 0.55),
      accent: mix(p[2], "#ffffff", 0.2),
      shadow: mix(p[0], "#000000", 0.35),
      light,
    };
  }
  return {
    bgTop: p[0],
    bgBottom: p[1],
    subject: p[3],
    accent: p[2],
    shadow: mix(p[0], "#000000", 0.5),
    light,
  };
}

interface Placement {
  x: number;
  y: number;
  scale: number;
}

function placement(request: GenerationRequest, rng: Rng): Placement {
  const { composition, atmosphere } = request.choices;
  let p: Placement;
  switch (composition) {
    case "tiers":
      p = { x: rng.pick([360, 664]), y: 470, scale: 0.85 };
      break;
    case "horizon":
      p = { x: 512, y: 600, scale: 0.75 };
      break;
    case "proche":
      p = { x: 512, y: 560, scale: 1.4 };
      break;
    case "lointain":
      p = { x: 512, y: 580, scale: 0.42 };
      break;
    default:
      p = { x: 512, y: 512, scale: 1 };
  }
  if (atmosphere === "distance") p.scale *= 0.6;
  if (atmosphere === "legerete") p.y -= 70;
  if (request.adjustments.includes("plus-proche")) p.scale *= 1.3;
  if (request.adjustments.includes("plus-espace")) p.scale *= 0.65;
  return p;
}

/* ------------------------------------------------------------------ */
/* Formes                                                             */
/* ------------------------------------------------------------------ */

function blobPath(rng: Rng, radius: number, irregularity: number, points = 10) {
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const r = radius * (1 - irregularity / 2 + rng.next() * irregularity);
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  // Courbe lissée passant par les milieux des segments.
  const mid = (a: [number, number], b: [number, number]) => [
    (a[0] + b[0]) / 2,
    (a[1] + b[1]) / 2,
  ];
  const start = mid(pts[pts.length - 1], pts[0]);
  let d = `M ${r1(start[0])} ${r1(start[1])}`;
  for (let i = 0; i < pts.length; i++) {
    const m = mid(pts[i], pts[(i + 1) % pts.length]);
    d += ` Q ${r1(pts[i][0])} ${r1(pts[i][1])} ${r1(m[0])} ${r1(m[1])}`;
  }
  return d + " Z";
}

function drawShape(
  shape: string | null,
  pal: Palette,
  rng: Rng,
  fragile: boolean,
): string {
  const stroke = fragile ? 1 : 2;
  switch (shape) {
    case "silhouette":
      return `
        <g fill="url(#subjectFade)">
          <ellipse cx="0" cy="-190" rx="40" ry="48"/>
          <path d="M -24 -140 C -80 -132 -118 -100 -124 -40 L -146 230 L 146 230 L 124 -40 C 118 -100 80 -132 24 -140 Z"/>
        </g>`;
    case "vide": {
      return `
        <rect x="-230" y="-230" width="460" height="460" fill="none" stroke="${pal.subject}" stroke-opacity="0.35" stroke-width="${stroke}"/>
        <circle cx="${r1(rng.range(-60, 60))}" cy="${r1(rng.range(40, 140))}" r="5" fill="${pal.subject}" fill-opacity="0.8"/>`;
    }
    case "fils": {
      let paths = "";
      for (let i = 0; i < 16; i++) {
        const pt = () => `${r1(rng.range(-260, 260))} ${r1(rng.range(-260, 260))}`;
        paths += `<path d="M ${pt()} C ${pt()} ${pt()} ${pt()} S ${pt()} ${pt()}" fill="none" stroke="${i % 4 === 0 ? pal.accent : pal.subject}" stroke-width="${r1(rng.range(0.8, 3) * stroke)}" stroke-opacity="${r1(rng.range(0.4, 0.9))}" stroke-linecap="round"/>`;
      }
      return paths;
    }
    case "lumiere":
      return `
        <circle cx="0" cy="-40" r="300" fill="url(#glow)"/>
        <path d="${blobPath(rng, 190, 0.35, 9)}" fill="${pal.shadow}" fill-opacity="0.92" transform="translate(${r1(rng.range(-30, 30))} 30)"/>`;
    case "porte":
      return `
        <rect x="-170" y="232" width="340" height="10" fill="${pal.accent}" fill-opacity="0.7" filter="url(#softBlur)"/>
        <rect x="-100" y="-230" width="200" height="460" fill="${pal.shadow}" stroke="${pal.subject}" stroke-opacity="0.5" stroke-width="${stroke * 2}"/>
        <rect x="96" y="-226" width="5" height="452" fill="${pal.accent}" fill-opacity="0.85" filter="url(#softBlur)"/>
        <circle cx="62" cy="10" r="7" fill="${pal.subject}" fill-opacity="0.8"/>`;
    case "transformation": {
      let particles = "";
      for (let i = 0; i < 40; i++) {
        const x = rng.range(80, 320);
        const y = rng.range(-140, 140) * (1 - (x - 80) / 400);
        particles += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(rng.range(2, 14) * (1 - (x - 80) / 320) + 1)}" fill="${pal.subject}" fill-opacity="${r1(rng.range(0.3, 0.9))}"/>`;
      }
      return `
        <path d="${blobPath(rng, 170, 0.45, 11)}" fill="url(#subjectFade)" transform="translate(-60 0)"/>
        ${particles}`;
    }
    case "fragments": {
      let shards = "";
      for (let i = 0; i < 22; i++) {
        const angle = rng.range(0, Math.PI * 2);
        const dist = rng.range(20, 300);
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        const s = rng.range(14, 56) * (1 - dist / 500);
        const pts = [0, 1, 2, rng.int(0, 1) ? 3 : null]
          .filter((v): v is number => v !== null)
          .map((k) => {
            const a = (k / 3) * Math.PI * 2 + rng.range(-0.6, 0.6);
            return `${r1(Math.cos(a) * s)},${r1(Math.sin(a) * s)}`;
          })
          .join(" ");
        shards += `<polygon points="${pts}" transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(rng.range(0, 360))})" fill="${i % 3 === 0 ? pal.accent : pal.subject}" fill-opacity="${r1(rng.range(0.35, 0.9))}"/>`;
      }
      return shards;
    }
    default:
      // Pas de forme choisie : un champ de lumière ouvert.
      return `<circle cx="0" cy="0" r="320" fill="url(#glow)" opacity="0.8"/>`;
  }
}

/* ------------------------------------------------------------------ */
/* Matières                                                           */
/* ------------------------------------------------------------------ */

function textureDefs(texture: string | null, seed: number): string {
  const s = seed % 1000;
  switch (texture) {
    case "eau":
      return `<filter id="tex" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.002 0.03" numOctaves="2" seed="${s}"/><feDisplacementMap in="SourceGraphic" scale="40"/></filter>`;
    case "fluide":
      return `<filter id="tex" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="turbulence" baseFrequency="0.009" numOctaves="3" seed="${s}"/><feDisplacementMap in="SourceGraphic" scale="70"/></filter>`;
    case "doux":
      return `<filter id="tex" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>`;
    case "brume":
      return `<filter id="tex" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>`;
    default:
      return `<filter id="tex"><feOffset dx="0" dy="0"/></filter>`;
  }
}

function textureOverlay(texture: string | null, pal: Palette, rng: Rng, seed: number): string {
  const s = seed % 1000;
  switch (texture) {
    case "brume": {
      let fog = "";
      for (let i = 0; i < 7; i++) {
        fog += `<ellipse cx="${r1(rng.range(0, SIZE))}" cy="${r1(rng.range(300, SIZE))}" rx="${r1(rng.range(220, 480))}" ry="${r1(rng.range(60, 140))}" fill="${pal.light ? "#ffffff" : pal.accent}" fill-opacity="${r1(rng.range(0.08, 0.2))}" filter="url(#bigBlur)"/>`;
      }
      return fog;
    }
    case "verre": {
      let cracks = "";
      for (let c = 0; c < 2; c++) {
        const ox = rng.range(250, 774);
        const oy = rng.range(250, 774);
        for (let i = 0; i < 9; i++) {
          let x = ox;
          let y = oy;
          let d = `M ${r1(x)} ${r1(y)}`;
          let a = rng.range(0, Math.PI * 2);
          const segs = rng.int(3, 7);
          for (let k = 0; k < segs; k++) {
            a += rng.range(-0.4, 0.4);
            const len = rng.range(30, 110);
            x += Math.cos(a) * len;
            y += Math.sin(a) * len;
            d += ` L ${r1(x)} ${r1(y)}`;
          }
          cracks += `<path d="${d}" fill="none" stroke="#ffffff" stroke-opacity="${r1(rng.range(0.25, 0.6))}" stroke-width="${r1(rng.range(0.6, 1.8))}"/>`;
        }
      }
      return cracks;
    }
    case "papier":
      return `<filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="${s}" result="n"/><feDiffuseLighting in="n" lighting-color="#ffffff" surfaceScale="3"><feDistantLight azimuth="45" elevation="55"/></feDiffuseLighting></filter>
        <rect width="${SIZE}" height="${SIZE}" filter="url(#paper)" opacity="0.32" style="mix-blend-mode:multiply"/>`;
    case "pierre":
      return `<filter id="stone"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" seed="${s}"/><feColorMatrix type="saturate" values="0"/></filter>
        <filter id="mottle"><feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="3" seed="${s + 1}"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="${SIZE}" height="${SIZE}" filter="url(#mottle)" opacity="0.22" style="mix-blend-mode:overlay"/>
        <rect width="${SIZE}" height="${SIZE}" filter="url(#stone)" opacity="0.18" style="mix-blend-mode:overlay"/>`;
    case "eau": {
      let lines = "";
      for (let i = 0; i < 12; i++) {
        const y = rng.range(560, 1000);
        lines += `<rect x="${r1(rng.range(0, 700))}" y="${r1(y)}" width="${r1(rng.range(80, 320))}" height="1.5" fill="#ffffff" fill-opacity="${r1(rng.range(0.1, 0.35))}"/>`;
      }
      return lines;
    }
    case "doux":
      return `<rect width="${SIZE}" height="${SIZE}" fill="${pal.accent}" fill-opacity="0.06"/>`;
    default:
      return "";
  }
}

/* ------------------------------------------------------------------ */
/* Atmosphères                                                        */
/* ------------------------------------------------------------------ */

function atmosphereLayer(atmosphere: string | null, pal: Palette, rng: Rng): string {
  switch (atmosphere) {
    case "ouverture":
      return `<path d="M 430 0 L 594 0 L 860 1024 L 164 1024 Z" fill="url(#beam)" opacity="0.55" filter="url(#bigBlur)"/>`;
    case "legerete": {
      let motes = "";
      for (let i = 0; i < 30; i++) {
        motes += `<circle cx="${r1(rng.range(0, SIZE))}" cy="${r1(rng.range(0, SIZE))}" r="${r1(rng.range(1, 4))}" fill="#ffffff" fill-opacity="${r1(rng.range(0.2, 0.6))}"/>`;
      }
      return motes;
    }
    case "tension":
      return `<rect width="${SIZE}" height="${SIZE}" fill="url(#vignette)" opacity="0.9"/>
        <line x1="0" y1="${r1(rng.range(300, 700))}" x2="${SIZE}" y2="${r1(rng.range(300, 700))}" stroke="${pal.accent}" stroke-opacity="0.5" stroke-width="1"/>`;
    case "distance":
    case "silence":
      return `<rect width="${SIZE}" height="${SIZE}" fill="${pal.light ? "#ffffff" : pal.bgBottom}" fill-opacity="0.18"/>`;
    default:
      return "";
  }
}

export function renderDemoSvg(request: GenerationRequest): string {
  const { choices, adjustments, seed } = request;
  const rng = createRng(seed);
  const pal = buildPalette(choices.color, rng);
  const place = placement(request, rng);
  const fragile = choices.atmosphere === "fragilite";
  const abstract = adjustments.includes("plus-abstrait");
  const angle = rng.range(-25, 25);

  const shape = drawShape(choices.shape, pal, rng, fragile);
  let subjectOpacity = fragile ? 0.6 : 0.92;
  if (adjustments.includes("plus-doux")) subjectOpacity *= 0.75;

  // Mouvement : échos successifs de la forme.
  const echoes =
    choices.atmosphere === "mouvement"
      ? [3, 2, 1]
          .map(
            (k) =>
              `<g transform="translate(${-k * 34} ${k * 6})" opacity="${r1(0.12 * (4 - k))}">${shape}</g>`,
          )
          .join("")
      : "";

  const brighten = adjustments.includes("plus-clair")
    ? `<rect width="${SIZE}" height="${SIZE}" fill="#ffffff" fill-opacity="0.16"/>`
    : "";
  const darken = adjustments.includes("plus-sombre")
    ? `<rect width="${SIZE}" height="${SIZE}" fill="#000000" fill-opacity="0.28"/>`
    : "";
  const saturate = adjustments.includes("plus-intense") ? 1.6 : adjustments.includes("plus-doux") ? 0.7 : 1;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
<defs>
  <linearGradient id="bg" gradientTransform="rotate(${r1(90 + angle)} 0.5 0.5)">
    <stop offset="0" stop-color="${pal.bgTop}"/>
    <stop offset="1" stop-color="${pal.bgBottom}"/>
  </linearGradient>
  <radialGradient id="glow">
    <stop offset="0" stop-color="${pal.light ? "#ffffff" : pal.subject}" stop-opacity="0.95"/>
    <stop offset="0.35" stop-color="${pal.accent}" stop-opacity="0.45"/>
    <stop offset="1" stop-color="${pal.accent}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="subjectFade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${pal.subject}" stop-opacity="1"/>
    <stop offset="0.75" stop-color="${pal.subject}" stop-opacity="0.65"/>
    <stop offset="1" stop-color="${pal.subject}" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.8"/>
    <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
    <stop offset="0.55" stop-color="#000000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000000" stop-opacity="0.85"/>
  </radialGradient>
  <radialGradient id="ambient" cx="${r1(place.x / SIZE)}" cy="${r1(place.y / SIZE)}" r="0.6">
    <stop offset="0" stop-color="${pal.accent}" stop-opacity="0.35"/>
    <stop offset="1" stop-color="${pal.accent}" stop-opacity="0"/>
  </radialGradient>
  <filter id="softBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="bigBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
  <filter id="abstract" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="turbulence" baseFrequency="0.012" numOctaves="2" seed="${seed % 997}"/><feDisplacementMap in="SourceGraphic" scale="${abstract ? 90 : 0}"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed % 991}"/><feColorMatrix type="saturate" values="0"/></filter>
  <filter id="tone"><feColorMatrix type="saturate" values="${saturate}"/></filter>
  ${textureDefs(choices.texture, seed)}
</defs>
<g filter="url(#tone)">
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#ambient)"/>
  ${choices.composition === "horizon" ? `<rect x="0" y="760" width="${SIZE}" height="264" fill="${pal.shadow}" fill-opacity="0.35"/><line x1="0" y1="760" x2="${SIZE}" y2="760" stroke="${pal.accent}" stroke-opacity="0.4"/>` : ""}
  <g filter="url(#tex)">
    <g filter="url(#abstract)">
      <g transform="translate(${r1(place.x)} ${r1(place.y)}) scale(${r1(place.scale * 100) / 100})">
        ${echoes}
        <g opacity="${r1(subjectOpacity * 100) / 100}">${shape}</g>
      </g>
    </g>
  </g>
  ${textureOverlay(choices.texture, pal, rng, seed)}
  ${atmosphereLayer(choices.atmosphere, pal, rng)}
  ${brighten}${darken}
  <rect width="${SIZE}" height="${SIZE}" fill="url(#vignette)" opacity="${pal.light ? 0.15 : 0.45}"/>
  <rect width="${SIZE}" height="${SIZE}" filter="url(#grain)" opacity="0.07"/>
</g>
</svg>`;
}

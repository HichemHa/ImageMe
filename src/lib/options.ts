/**
 * Catalogue des choix proposés dans le parcours.
 *
 * Chaque option a :
 *  - un libellé affiché (français, tutoiement),
 *  - un fragment de prompt (anglais : les modèles d'image le comprennent mieux),
 *  - éventuellement des indices visuels pour l'interface et le mode démonstration.
 *
 * Ces options sont des points de départ, jamais des diagnostics.
 */

export type CategoryId =
  | "feeling"
  | "shape"
  | "color"
  | "texture"
  | "atmosphere"
  | "style";

export interface Option {
  id: string;
  label: string;
  /** Fragment intégré au prompt. Vide = aucune contrainte. */
  prompt: string;
}

export interface ColorOption extends Option {
  /** Palette indicative (interface + mode démonstration). */
  palette: [string, string, string, string];
}

export const FEELINGS: Option[] = [
  {
    id: "incompris",
    label: "Je ressens quelque chose que je ne comprends pas.",
    prompt:
      "an undefined inner sensation that is hard to name, ambiguous and unresolved",
  },
  {
    id: "trop-plein",
    label: "J'ai trop de choses à l'intérieur.",
    prompt:
      "a sense of inner fullness close to overflowing, many layers pressing together",
  },
  {
    id: "non-dit",
    label: "Je n'arrive pas à dire quelque chose à quelqu'un.",
    prompt:
      "something unspoken held between two presences, a message not yet delivered",
  },
  {
    id: "absence",
    label: "Je ressens une absence.",
    prompt:
      "the quiet presence of an absence, a space where something used to be",
  },
  {
    id: "perdu",
    label: "Je me sens perdu·e.",
    prompt: "a feeling of drifting without landmarks or clear direction",
  },
  {
    id: "beau",
    label: "Je ressens quelque chose de beau que je ne sais pas expliquer.",
    prompt: "a quiet, luminous beauty that cannot be put into words",
  },
  {
    id: "libre",
    label: "Je préfère explorer sans choisir de sentiment.",
    prompt: "",
  },
];

export const SHAPES: Option[] = [
  {
    id: "silhouette",
    label: "Une silhouette",
    prompt: "a solitary, anonymous human silhouette with no visible face",
  },
  {
    id: "vide",
    label: "Un espace vide",
    prompt: "a vast empty space, negative space dominating the composition",
  },
  {
    id: "fils",
    label: "Des fils emmêlés",
    prompt: "tangled threads weaving and knotting through the space",
  },
  {
    id: "lumiere",
    label: "Une lumière cachée",
    prompt: "a hidden light glowing faintly from behind or within something",
  },
  {
    id: "porte",
    label: "Une porte fermée",
    prompt: "a single closed door standing on its own",
  },
  {
    id: "transformation",
    label: "Une forme qui se transforme",
    prompt: "an organic form caught in the middle of becoming something else",
  },
  {
    id: "fragments",
    label: "Des fragments dispersés",
    prompt: "scattered fragments slowly drifting apart",
  },
];

export const COLORS: ColorOption[] = [
  {
    id: "bleu",
    label: "Bleu profond",
    prompt: "deep blue, indigo and midnight tones",
    palette: ["#07142b", "#1b3170", "#3f63c9", "#a9c1ff"],
  },
  {
    id: "rouge-noir",
    label: "Rouge et noir",
    prompt: "deep red against black, crimson emerging from darkness",
    palette: ["#080405", "#350a10", "#8c1c22", "#e0484a"],
  },
  {
    id: "pastel",
    label: "Tons pastel",
    prompt: "soft pastel tones, powder pink, lavender and pale mint",
    palette: ["#e9dcef", "#f6d9e3", "#d3ece4", "#fcefdc"],
  },
  {
    id: "blanc",
    label: "Blanc lumineux",
    prompt: "luminous white, pearl and pale silvery light",
    palette: ["#d8d6cf", "#ebe9e3", "#f6f5f1", "#ffffff"],
  },
  {
    id: "chaud",
    label: "Couleurs chaudes",
    prompt: "warm colors, amber, ochre, terracotta and golden light",
    palette: ["#2c1408", "#91401b", "#de853a", "#f7cb73"],
  },
  {
    id: "libre",
    label: "Palette libre",
    prompt: "a free, intuitive palette chosen to serve the mood",
    palette: ["#1d1a3a", "#5b3f8c", "#d0798b", "#f2c28b"],
  },
];

export const TEXTURES: Option[] = [
  { id: "brume", label: "Brume", prompt: "soft mist and haze" },
  {
    id: "verre",
    label: "Verre fissuré",
    prompt: "cracked glass, fine fractures catching the light",
  },
  { id: "eau", label: "Eau", prompt: "water, ripples and liquid reflections" },
  {
    id: "papier",
    label: "Papier froissé",
    prompt: "crumpled paper with soft creases and folds",
  },
  {
    id: "doux",
    label: "Matière douce",
    prompt: "a soft, velvety and tender material",
  },
  { id: "pierre", label: "Pierre", prompt: "raw grainy stone, mineral surfaces" },
  {
    id: "fluide",
    label: "Matière fluide",
    prompt: "fluid matter flowing like ink dissolving in water",
  },
];

export const ATMOSPHERES: Option[] = [
  {
    id: "silence",
    label: "Silence",
    prompt: "silent and still, suspended in time",
  },
  {
    id: "distance",
    label: "Distance",
    prompt: "a sense of distance and separation, wide space between elements",
  },
  {
    id: "mouvement",
    label: "Mouvement",
    prompt: "gentle movement, a sense of flow and drifting motion",
  },
  {
    id: "fragilite",
    label: "Fragilité",
    prompt: "fragile and delicate, as if it could break at any moment",
  },
  {
    id: "legerete",
    label: "Légèreté",
    prompt: "light, airy and weightless",
  },
  {
    id: "tension",
    label: "Tension",
    prompt: "a quiet tension, like a held breath, with strong contrast",
  },
  {
    id: "ouverture",
    label: "Ouverture",
    prompt: "a sense of opening and possibility, light breaking through",
  },
];

export const STYLES: Option[] = [
  {
    id: "photo",
    label: "Photographie poétique",
    prompt: "poetic fine-art photography, analog film grain, shallow depth of field",
  },
  {
    id: "surreal",
    label: "Art surréaliste",
    prompt: "surrealist painting, dreamlike and quietly uncanny",
  },
  {
    id: "abstrait",
    label: "Art abstrait",
    prompt: "abstract contemporary artwork, expressive shapes and fields of color",
  },
  {
    id: "collage",
    label: "Collage artistique",
    prompt: "artistic mixed-media collage, torn paper edges and layered textures",
  },
  {
    id: "minimal",
    label: "Illustration minimaliste",
    prompt: "minimalist illustration, few elements, refined and calm",
  },
  {
    id: "organique",
    label: "Formes organiques",
    prompt: "organic sculptural forms, soft light and shadow, translucent depth",
  },
];

/** Compositions possibles, choisies discrètement par l'application. */
export const COMPOSITIONS: Option[] = [
  {
    id: "centre",
    label: "Centrée, beaucoup d'espace",
    prompt: "centered subject surrounded by generous negative space",
  },
  {
    id: "tiers",
    label: "Décentrée",
    prompt: "off-center composition following the rule of thirds",
  },
  {
    id: "horizon",
    label: "Horizon bas",
    prompt: "low horizon line beneath a vast open space",
  },
  {
    id: "proche",
    label: "Cadrage intime",
    prompt: "close, intimate framing",
  },
  {
    id: "lointain",
    label: "Vu de loin",
    prompt: "seen from afar, small within a large space",
  },
];

/** Ajustements proposés quand l'image est « proche, mais pas exactement ça ». */
export const ADJUSTMENTS: Option[] = [
  { id: "plus-doux", label: "Plus doux", prompt: "softer and gentler, lower contrast" },
  { id: "plus-intense", label: "Plus intense", prompt: "more intense and vivid, stronger contrast" },
  { id: "plus-clair", label: "Plus lumineux", prompt: "brighter, more light in the scene" },
  { id: "plus-sombre", label: "Plus sombre", prompt: "darker, deeper shadows" },
  { id: "plus-proche", label: "Plus proche", prompt: "closer and more intimate" },
  { id: "plus-espace", label: "Plus d'espace", prompt: "more empty space around the subject" },
  { id: "plus-abstrait", label: "Plus abstrait", prompt: "more abstract and less literal" },
];

export const CATEGORIES: Record<CategoryId, Option[]> = {
  feeling: FEELINGS,
  shape: SHAPES,
  color: COLORS,
  texture: TEXTURES,
  atmosphere: ATMOSPHERES,
  style: STYLES,
};

export function findOption(category: CategoryId, id: string | null | undefined) {
  if (!id) return undefined;
  return CATEGORIES[category].find((o) => o.id === id);
}

export function findColor(id: string | null | undefined): ColorOption | undefined {
  if (!id) return undefined;
  return COLORS.find((o) => o.id === id);
}

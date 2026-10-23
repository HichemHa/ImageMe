import {
  ADJUSTMENTS,
  CATEGORIES,
  COMPOSITIONS,
  type CategoryId,
} from "./options";
import { createRng, randomSeed } from "./rng";

/**
 * Valeur d'un choix dans le parcours :
 *  - un identifiant d'option,
 *  - "random" : laisser le hasard choisir,
 *  - null : étape passée / pas de réponse.
 */
export type Choice = string | "random" | "custom" | null;

export const RANDOM = "random" as const;

/** « Autre… » : l'utilisateur s'exprime avec ses propres mots, dans sa langue. */
export const CUSTOM = "custom" as const;

/** Catégories qui acceptent une réponse libre (toutes sauf le style). */
export type TextCategory = Exclude<CategoryId, "style">;
export const TEXT_CATEGORIES: TextCategory[] = [
  "feeling",
  "shape",
  "color",
  "texture",
  "atmosphere",
];
export type CustomTexts = Partial<Record<TextCategory, string>>;

/** Longueur maximale d'une réponse libre : quelques mots, pas un récit. */
export const MAX_TEXT_LENGTH = 120;

export type Selection = Record<CategoryId, Choice> & { texts: CustomTexts };

export const EMPTY_SELECTION: Selection = {
  feeling: null,
  shape: null,
  color: null,
  texture: null,
  atmosphere: null,
  style: RANDOM,
  texts: {},
};

/**
 * Nettoie un texte libre : caractères de contrôle retirés, espaces
 * normalisés, guillemets droits remplacés (ils délimitent le texte dans le
 * prompt), longueur bornée.
 */
export function sanitizeText(input: unknown, max = MAX_TEXT_LENGTH): string {
  if (typeof input !== "string") return "";
  return input
    .normalize("NFC")
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, " ")
    .replace(/"/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max)
    .trim();
}

/** Choix concrets envoyés au serveur : un identifiant, "custom" ou null. */
export interface ResolvedChoices {
  feeling: string | null;
  shape: string | null;
  color: string | null;
  texture: string | null;
  atmosphere: string | null;
  style: string;
  composition: string;
}

export interface GenerationRequest {
  choices: ResolvedChoices;
  /** Mots de l'utilisateur, pour chaque catégorie valant "custom". */
  texts: CustomTexts;
  adjustments: string[];
  seed: number;
}

/** Catégories pour lesquelles le hasard a tranché (pour l'afficher). */
export type RandomPicks = Partial<Record<CategoryId, true>>;

/**
 * Transforme la sélection de l'utilisateur en choix concrets.
 * Les « random » sont tirés au sort ; le style et la composition sont
 * choisis par l'application quand l'utilisateur ne les a pas fixés.
 */
export function resolveSelection(
  selection: Selection,
  seed: number = randomSeed(),
): { choices: ResolvedChoices; texts: CustomTexts; randomPicks: RandomPicks } {
  const rng = createRng(seed);
  const randomPicks: RandomPicks = {};
  const texts: CustomTexts = {};

  const pick = (category: CategoryId): string | null => {
    const value = selection[category];
    const options = CATEGORIES[category];
    if (value === CUSTOM && category !== "style") {
      const text = sanitizeText(selection.texts?.[category]);
      if (!text) return null;
      texts[category] = text;
      return CUSTOM;
    }
    if (value === RANDOM) {
      randomPicks[category] = true;
      // Le hasard ne choisit jamais « explorer sans sentiment » à la place
      // de l'utilisateur : ce choix reste le sien.
      const pool =
        category === "feeling" ? options.filter((o) => o.prompt) : options;
      return rng.pick(pool).id;
    }
    if (value && options.some((o) => o.id === value)) return value;
    return null;
  };

  const style = pick("style") ?? rng.pick(CATEGORIES.style).id;

  return {
    choices: {
      feeling: pick("feeling"),
      shape: pick("shape"),
      color: pick("color"),
      texture: pick("texture"),
      atmosphere: pick("atmosphere"),
      style,
      composition: rng.pick(COMPOSITIONS).id,
    },
    texts,
    randomPicks,
  };
}

const MAX_ADJUSTMENTS = 4;

/**
 * Valide strictement une requête de génération venant du navigateur.
 * Seuls des identifiants connus sont acceptés, plus de courts textes libres
 * (« Autre… ») nettoyés et bornés, uniquement pour les catégories qui valent
 * "custom".
 */
export function parseGenerationRequest(
  input: unknown,
): { ok: true; value: GenerationRequest } | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Requête invalide." };
  }
  const raw = input as Record<string, unknown>;
  const rawChoices = raw.choices as Record<string, unknown> | undefined;
  if (!rawChoices || typeof rawChoices !== "object") {
    return { ok: false, error: "Choix manquants." };
  }

  const rawTexts =
    raw.texts && typeof raw.texts === "object" ? (raw.texts as Record<string, unknown>) : {};
  const texts: CustomTexts = {};

  const optional = (category: CategoryId): string | null | Error => {
    const v = rawChoices[category];
    if (v === null || v === undefined) return null;
    if (v === CUSTOM && category !== "style") {
      const text = sanitizeText(rawTexts[category]);
      if (!text) return new Error(`${category} (texte vide)`);
      texts[category] = text;
      return CUSTOM;
    }
    if (typeof v === "string" && CATEGORIES[category].some((o) => o.id === v)) {
      return v;
    }
    return new Error(category);
  };

  const feeling = optional("feeling");
  const shape = optional("shape");
  const color = optional("color");
  const texture = optional("texture");
  const atmosphere = optional("atmosphere");
  const style = optional("style");
  const composition =
    typeof rawChoices.composition === "string" &&
    COMPOSITIONS.some((c) => c.id === rawChoices.composition)
      ? (rawChoices.composition as string)
      : new Error("composition");

  for (const v of [feeling, shape, color, texture, atmosphere, style, composition]) {
    if (v instanceof Error) {
      return { ok: false, error: `Choix inconnu : ${v.message}.` };
    }
  }
  if (!style || composition instanceof Error) {
    return { ok: false, error: "Style ou composition manquants." };
  }

  const rawAdjustments = raw.adjustments ?? [];
  if (
    !Array.isArray(rawAdjustments) ||
    rawAdjustments.length > MAX_ADJUSTMENTS ||
    !rawAdjustments.every(
      (a) => typeof a === "string" && ADJUSTMENTS.some((o) => o.id === a),
    )
  ) {
    return { ok: false, error: "Ajustements invalides." };
  }

  const seed = raw.seed;
  if (
    typeof seed !== "number" ||
    !Number.isInteger(seed) ||
    seed < 0 ||
    seed > 0xffffffff
  ) {
    return { ok: false, error: "Graine invalide." };
  }

  return {
    ok: true,
    value: {
      choices: {
        feeling: feeling as string | null,
        shape: shape as string | null,
        color: color as string | null,
        texture: texture as string | null,
        atmosphere: atmosphere as string | null,
        style: style as string,
        composition,
      },
      texts,
      adjustments: [...new Set(rawAdjustments as string[])],
      seed,
    },
  };
}

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
export type Choice = string | "random" | null;

export const RANDOM = "random" as const;

export type Selection = Record<CategoryId, Choice>;

export const EMPTY_SELECTION: Selection = {
  feeling: null,
  shape: null,
  color: null,
  texture: null,
  atmosphere: null,
  style: RANDOM,
};

/** Choix concrets envoyés au serveur : un identifiant ou null. */
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
): { choices: ResolvedChoices; randomPicks: RandomPicks } {
  const rng = createRng(seed);
  const randomPicks: RandomPicks = {};

  const pick = (category: CategoryId): string | null => {
    const value = selection[category];
    const options = CATEGORIES[category];
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
    randomPicks,
  };
}

const MAX_ADJUSTMENTS = 4;

/**
 * Valide strictement une requête de génération venant du navigateur.
 * Seuls des identifiants connus sont acceptés : aucun texte libre n'atteint
 * le fournisseur d'IA.
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

  const optional = (category: CategoryId): string | null | Error => {
    const v = rawChoices[category];
    if (v === null || v === undefined) return null;
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
      adjustments: [...new Set(rawAdjustments as string[])],
      seed,
    },
  };
}

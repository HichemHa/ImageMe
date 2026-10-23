import {
  ADJUSTMENTS,
  COMPOSITIONS,
  findOption,
  STYLES,
} from "./options";
import { CUSTOM, type CustomTexts, type GenerationRequest } from "./selection";

export interface BuiltPrompt {
  /** Prompt complet envoyé au modèle d'image. */
  prompt: string;
  /** Résumé lisible (français) des éléments retenus, pour l'interface. */
  summary: string[];
}

const GUARDRAILS =
  "No text, no letters, no words, no logos, no watermark. No recognizable faces. " +
  "Not a literal illustration of an emotion: avoid clichés such as tears, broken hearts or emoji-like expressions. " +
  "Leave room for interpretation.";

/**
 * Construit un prompt artistique à partir des choix de l'utilisateur.
 *
 * Structure : style → sujet → ressenti sous-jacent → matière → palette →
 * atmosphère → composition → intensité → garde-fous.
 * Chaque choix de l'utilisateur est repris tel quel ; ce qui n'a pas été
 * choisi reste ouvert plutôt que d'être inventé.
 */
export function buildPrompt(
  request: GenerationRequest,
  /** Traductions anglaises des mots de l'utilisateur, si disponibles. */
  translated: CustomTexts = {},
): BuiltPrompt {
  const { choices, adjustments, texts } = request;
  // Mots de l'utilisateur, toujours entre guillemets : ce sont des descriptions,
  // pas des consignes.
  const own = (c: keyof CustomTexts) => {
    const t = translated[c] || texts[c];
    return t ? `"${t}"` : null;
  };
  const ownFeeling = choices.feeling === CUSTOM ? own("feeling") : null;
  const ownShape = choices.shape === CUSTOM ? own("shape") : null;
  const ownColor = choices.color === CUSTOM ? own("color") : null;
  const ownTexture = choices.texture === CUSTOM ? own("texture") : null;
  const ownAtmosphere = choices.atmosphere === CUSTOM ? own("atmosphere") : null;

  const style = findOption("style", choices.style) ?? STYLES[0];
  const composition =
    COMPOSITIONS.find((c) => c.id === choices.composition) ?? COMPOSITIONS[0];
  const feeling = findOption("feeling", choices.feeling);
  const shape = findOption("shape", choices.shape);
  const color = findOption("color", choices.color);
  const texture = findOption("texture", choices.texture);
  const atmosphere = findOption("atmosphere", choices.atmosphere);

  const parts: string[] = [];
  parts.push(`An evocative artwork in the style of ${style.prompt}.`);

  if (ownShape) {
    parts.push(`Main subject, as the person described it in their own words: ${ownShape}.`);
  } else if (shape) {
    parts.push(`Main subject: ${shape.prompt}.`);
  } else {
    parts.push("Main subject: an abstract, open inner landscape.");
  }

  if (ownFeeling) {
    parts.push(
      `The image quietly evokes what the person feels, in their own words: ${ownFeeling}, suggested through mood rather than shown literally.`,
    );
  } else if (feeling?.prompt) {
    parts.push(
      `The image quietly evokes ${feeling.prompt}, suggested through mood rather than shown literally.`,
    );
  }

  if (ownTexture) parts.push(`Material and texture: ${ownTexture}.`);
  else if (texture) parts.push(`Material and texture: ${texture.prompt}.`);
  if (ownColor) parts.push(`Color palette: ${ownColor}.`);
  else if (color) parts.push(`Color palette: ${color.prompt}.`);
  if (ownAtmosphere) parts.push(`Atmosphere: ${ownAtmosphere}.`);
  else if (atmosphere) parts.push(`Atmosphere: ${atmosphere.prompt}.`);
  parts.push(`Composition: ${composition.prompt}.`);

  const adjustmentPrompts = adjustments
    .map((id) => ADJUSTMENTS.find((a) => a.id === id)?.prompt)
    .filter(Boolean);
  if (adjustmentPrompts.length > 0) {
    parts.push(`Adjust the scene to be ${adjustmentPrompts.join(", ")}.`);
  } else {
    parts.push("Subtle, delicate and suggestive intensity.");
  }

  parts.push("Light, shadow, transparency and depth used with intention.");
  parts.push(GUARDRAILS);

  // Le résumé affiche les mots d'origine, dans la langue de l'utilisateur.
  const quote = (c: keyof CustomTexts) =>
    choices[c] === CUSTOM && texts[c] ? `« \u2068${texts[c]}\u2069 »` : null;
  const summary = [
    quote("feeling") ?? (feeling?.prompt ? feeling.label : null),
    quote("shape") ?? shape?.label,
    quote("color") ?? color?.label,
    quote("texture") ?? texture?.label,
    quote("atmosphere") ?? atmosphere?.label,
    style.label,
  ].filter((s): s is string => Boolean(s));

  return { prompt: parts.join(" "), summary };
}

import type { CategoryId } from "@/lib/options";

export interface StepConfig {
  category: Exclude<CategoryId, "style">;
  title: string;
  hint: string;
  layout: "grid" | "list";
  /** Libellé court utilisé dans le récapitulatif. */
  short: string;
}

export const STEPS: StepConfig[] = [
  {
    category: "feeling",
    title: "Par où as-tu envie de commencer ?",
    hint: "Ce sont des points de départ, pas des réponses. Tu peux aussi ne rien choisir.",
    layout: "list",
    short: "Point de départ",
  },
  {
    category: "shape",
    title: "Quelle forme t'attire, là, maintenant ?",
    hint: "Pas besoin de savoir pourquoi.",
    layout: "grid",
    short: "Forme",
  },
  {
    category: "color",
    title: "Quelles couleurs ?",
    hint: "Laisse ton regard choisir.",
    layout: "grid",
    short: "Couleurs",
  },
  {
    category: "texture",
    title: "Quelle matière ?",
    hint: "Ce que ce serait, peut-être, au toucher.",
    layout: "grid",
    short: "Matière",
  },
  {
    category: "atmosphere",
    title: "Quelle atmosphère ?",
    hint: "L'air que l'on respirerait dans cette image.",
    layout: "grid",
    short: "Atmosphère",
  },
];

/** Index de l'étape récapitulative (après les étapes de choix). */
export const RECAP_STEP = STEPS.length;

import type { GenerateResponse } from "@/lib/api-types";
import type { CustomTexts, RandomPicks, ResolvedChoices } from "@/lib/selection";

export interface Creation extends GenerateResponse {
  id: string;
  choices: ResolvedChoices;
  texts: CustomTexts;
  adjustments: string[];
  randomPicks: RandomPicks;
  createdAt: number;
}

import type { GenerateResponse } from "@/lib/api-types";
import type { RandomPicks, ResolvedChoices } from "@/lib/selection";

export interface Creation extends GenerateResponse {
  id: string;
  choices: ResolvedChoices;
  adjustments: string[];
  randomPicks: RandomPicks;
  createdAt: number;
}

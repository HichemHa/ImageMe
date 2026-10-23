import { describe, expect, it } from "vitest";
import { buildPrompt } from "@/lib/prompt";
import type { GenerationRequest } from "@/lib/selection";

const base: GenerationRequest = {
  choices: {
    feeling: "incompris",
    shape: "silhouette",
    color: "bleu",
    texture: "verre",
    atmosphere: "silence",
    style: "photo",
    composition: "centre",
  },
  adjustments: [],
  seed: 42,
};

describe("buildPrompt", () => {
  it("reprend chaque choix de l'utilisateur", () => {
    const { prompt, summary } = buildPrompt(base);
    expect(prompt).toContain("human silhouette");
    expect(prompt).toContain("cracked glass");
    expect(prompt).toContain("deep blue");
    expect(prompt).toContain("silent and still");
    expect(prompt).toContain("fine-art photography");
    expect(prompt).toContain("centered subject");
    expect(summary).toEqual([
      "Je ressens quelque chose que je ne comprends pas.",
      "Une silhouette",
      "Bleu profond",
      "Verre fissuré",
      "Silence",
      "Photographie poétique",
    ]);
  });

  it("suggère le ressenti sans l'imposer littéralement", () => {
    const { prompt } = buildPrompt(base);
    expect(prompt).toMatch(/rather than shown literally/);
    expect(prompt).toMatch(/No text/);
    expect(prompt).toMatch(/No recognizable faces/);
  });

  it("fonctionne quand rien n'est choisi", () => {
    const { prompt, summary } = buildPrompt({
      ...base,
      choices: {
        feeling: null,
        shape: null,
        color: null,
        texture: null,
        atmosphere: null,
        style: "abstrait",
        composition: "horizon",
      },
    });
    expect(prompt).toContain("abstract, open inner landscape");
    expect(prompt).not.toContain("Color palette");
    expect(summary).toEqual(["Art abstrait"]);
  });

  it("n'ajoute pas de ressenti pour « explorer sans choisir »", () => {
    const { prompt, summary } = buildPrompt({
      ...base,
      choices: { ...base.choices, feeling: "libre" },
    });
    expect(prompt).not.toContain("quietly evokes");
    expect(summary).not.toContain("Je préfère explorer sans choisir de sentiment.");
  });

  it("intègre les ajustements", () => {
    const { prompt } = buildPrompt({ ...base, adjustments: ["plus-doux", "plus-clair"] });
    expect(prompt).toContain("softer and gentler");
    expect(prompt).toContain("brighter");
    expect(prompt).not.toContain("Subtle, delicate");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { buildPrompt } from "@/lib/prompt";
import {
  CUSTOM,
  EMPTY_SELECTION,
  parseGenerationRequest,
  resolveSelection,
  sanitizeText,
  type GenerationRequest,
} from "@/lib/selection";
import { parseTranslation, translateTexts } from "@/lib/translate";

const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;

const request: GenerationRequest = {
  choices: {
    feeling: CUSTOM,
    shape: "porte",
    color: CUSTOM,
    texture: null,
    atmosphere: null,
    style: "photo",
    composition: "centre",
  },
  texts: { feeling: "حنين إلى البيت", color: "le bleu de la mer à 6h" },
  adjustments: [],
  seed: 1,
};

describe("« Autre… » : s'exprimer avec ses mots", () => {
  it("nettoie le texte libre", () => {
    expect(sanitizeText('  un  "cri"\n silencieux\u0000 ')).toBe("un 'cri' silencieux");
    expect(sanitizeText("x".repeat(500))).toHaveLength(120);
    expect(sanitizeText(42)).toBe("");
  });

  it("garde les mots de l'utilisateur lors de la résolution", () => {
    const { choices, texts } = resolveSelection(
      { ...EMPTY_SELECTION, shape: CUSTOM, texts: { shape: "  une fenêtre ouverte " } },
      3,
    );
    expect(choices.shape).toBe(CUSTOM);
    expect(texts.shape).toBe("une fenêtre ouverte");
  });

  it("ignore un « Autre » laissé vide", () => {
    const { choices, texts } = resolveSelection(
      { ...EMPTY_SELECTION, shape: CUSTOM, texts: { shape: "   " } },
      3,
    );
    expect(choices.shape).toBeNull();
    expect(texts).toEqual({});
  });

  it("valide côté serveur : texte requis, toutes langues acceptées", () => {
    const ok = parseGenerationRequest(request);
    expect(ok.ok && ok.value.texts).toEqual(request.texts);
    expect(
      parseGenerationRequest({ ...request, texts: { color: "le bleu" } }).ok,
    ).toBe(false);
    expect(
      parseGenerationRequest({
        ...request,
        choices: { ...request.choices, style: CUSTOM },
      }).ok,
    ).toBe(false);
  });

  it("ne transmet pas les textes des catégories non personnalisées", () => {
    const r = parseGenerationRequest({
      ...request,
      texts: { ...request.texts, shape: "ignoré" },
    });
    expect(r.ok && r.value.texts.shape).toBeFalsy();
  });

  it("intègre les mots (traduits si possible) entre guillemets dans le prompt", () => {
    const { prompt, summary } = buildPrompt(request, { feeling: "longing for home" });
    expect(prompt).toContain('in their own words: "longing for home"');
    expect(prompt).toContain('Color palette: "le bleu de la mer à 6h"');
    expect(prompt).toContain("single closed door");
    expect(summary).toContain("« \u2068حنين إلى البيت\u2069 »");
    expect(summary).toContain("« \u2068le bleu de la mer à 6h\u2069 »");
  });
});

describe("traduction", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("n'appelle rien sans Cloudflare ou sans texte", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await translateTexts(request.texts, env({ OPENAI_API_KEY: "k" }))).toEqual({});
    expect(
      await translateTexts({}, env({ CLOUDFLARE_ACCOUNT_ID: "a", CLOUDFLARE_API_TOKEN: "t" })),
    ).toEqual({});
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("traduit via Cloudflare et valide la réponse", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          result: {
            response: 'Voici : {"feeling":"longing for home","color":"sea blue at 6am","shape":"x"}',
          },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    const out = await translateTexts(
      request.texts,
      env({ CLOUDFLARE_ACCOUNT_ID: "a", CLOUDFLARE_API_TOKEN: "t" }),
    );
    expect(out).toEqual({ feeling: "longing for home", color: "sea blue at 6am" });
    expect(fetchMock.mock.calls[0][0]).toContain("/ai/run/@cf/meta/llama-3.1-8b-instruct");
  });

  it("garde les mots d'origine si la traduction échoue", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("réseau")));
    expect(
      await translateTexts(
        request.texts,
        env({ CLOUDFLARE_ACCOUNT_ID: "a", CLOUDFLARE_API_TOKEN: "t" }),
      ),
    ).toEqual({});
    expect(parseTranslation("pas de json", request.texts)).toEqual({});
    expect(parseTranslation({ feeling: 3 }, request.texts)).toEqual({});
  });
});

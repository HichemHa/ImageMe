import { afterEach, describe, expect, it, vi } from "vitest";
import { getImageProvider, resolveProviderId } from "@/lib/providers";
import { renderDemoSvg } from "@/lib/providers/demo";
import type { GenerationRequest } from "@/lib/selection";

const env = (vars: Record<string, string>) => vars as unknown as NodeJS.ProcessEnv;

const request: GenerationRequest = {
  choices: {
    feeling: "absence",
    shape: "fragments",
    color: "chaud",
    texture: "eau",
    atmosphere: "mouvement",
    style: "abstrait",
    composition: "centre",
  },
  adjustments: [],
  seed: 7,
};

describe("choix du fournisseur", () => {
  it("passe en mode démonstration sans clé", () => {
    expect(resolveProviderId(env({}))).toBe("demo");
    expect(getImageProvider(env({})).isDemo).toBe(true);
  });

  it("détecte les clés disponibles", () => {
    expect(resolveProviderId(env({ OPENAI_API_KEY: "k" }))).toBe("openai");
    expect(
      resolveProviderId(env({
        OPENAI_API_KEY: "k",
        CLOUDFLARE_ACCOUNT_ID: "a",
        CLOUDFLARE_API_TOKEN: "t",
      })),
    ).toBe("cloudflare");
  });

  it("respecte IMAGE_PROVIDER", () => {
    expect(
      resolveProviderId(env({ IMAGE_PROVIDER: "demo", OPENAI_API_KEY: "k" })),
    ).toBe("demo");
  });
});

describe("mode démonstration", () => {
  it("produit un SVG déterministe qui dépend des choix", () => {
    const a = renderDemoSvg(request);
    expect(a.startsWith("<svg")).toBe(true);
    expect(a).toBe(renderDemoSvg(request));
    expect(a).not.toBe(renderDemoSvg({ ...request, seed: 8 }));
    expect(a).not.toBe(
      renderDemoSvg({ ...request, choices: { ...request.choices, shape: "porte" } }),
    );
  });

  it("gère toutes les combinaisons sans erreur, même vides", () => {
    const empty: GenerationRequest = {
      ...request,
      choices: {
        feeling: null,
        shape: null,
        color: null,
        texture: null,
        atmosphere: null,
        style: "photo",
        composition: "horizon",
      },
    };
    expect(renderDemoSvg(empty)).toContain("</svg>");
    for (const shape of ["silhouette", "vide", "fils", "lumiere", "porte", "transformation", "fragments"]) {
      for (const texture of ["brume", "verre", "eau", "papier", "doux", "pierre", "fluide"]) {
        const svg = renderDemoSvg({ ...request, choices: { ...request.choices, shape, texture } });
        expect(svg).not.toContain("NaN");
        expect(svg).not.toContain("undefined");
      }
    }
  });
});

describe("fournisseurs réels (réponses simulées)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("OpenAI : envoie la clé côté serveur et renvoie l'image", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [{ b64_json: "AAAA" }] }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const provider = getImageProvider(env({ OPENAI_API_KEY: "sk-test" }));
    const img = await provider.generate({ prompt: "p", request });
    expect(img).toEqual({ base64: "AAAA", mimeType: "image/png" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("api.openai.com");
    expect(init.headers.Authorization).toBe("Bearer sk-test");
  });

  it("Cloudflare : transmet la graine et décode la réponse", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, result: { image: "BBBB" } }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const provider = getImageProvider(env({
      CLOUDFLARE_ACCOUNT_ID: "acc",
      CLOUDFLARE_API_TOKEN: "tok",
    }));
    const img = await provider.generate({ prompt: "p", request });
    expect(img).toEqual({ base64: "BBBB", mimeType: "image/jpeg" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/accounts/acc/ai/run/@cf/black-forest-labs/flux-1-schnell");
    expect(JSON.parse(init.body).seed).toBe(7);
  });

  it("normalise les erreurs sans exposer le détail", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("secret details", { status: 401 })),
    );
    const provider = getImageProvider(env({ OPENAI_API_KEY: "bad" }));
    await expect(provider.generate({ prompt: "p", request })).rejects.toMatchObject({
      code: "config",
    });
  });
});

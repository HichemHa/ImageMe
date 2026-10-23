import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv("IMAGE_PROVIDER", "demo");
});

const body = {
  choices: {
    feeling: null,
    shape: "lumiere",
    color: "blanc",
    texture: "brume",
    atmosphere: "ouverture",
    style: "organique",
    composition: "lointain",
  },
  adjustments: [],
  seed: 3,
};

async function call(payload: unknown) {
  const { POST } = await import("@/app/api/generate/route");
  return POST(
    new Request("http://localhost/api/generate", {
      method: "POST",
      body: typeof payload === "string" ? payload : JSON.stringify(payload),
    }),
  );
}

describe("POST /api/generate", () => {
  it("renvoie une image en mode démonstration, clairement signalée", async () => {
    const res = await call(body);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.demo).toBe(true);
    expect(json.provider).toBe("demo");
    expect(json.image).toMatch(/^data:image\/svg\+xml;base64,/);
    expect(json.prompt).toContain("hidden light");
  });

  it("refuse une requête invalide", async () => {
    expect((await call("pas du json")).status).toBe(400);
    const res = await call({ ...body, choices: { ...body.choices, color: "<script>" } });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid");
  });

  it("signale une configuration incomplète sans exposer de secret", async () => {
    vi.stubEnv("IMAGE_PROVIDER", "openai");
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await call(body);
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toBe("config");
    expect(JSON.stringify(json)).not.toContain("OPENAI_API_KEY");
  });
});

describe("createRateLimiter", () => {
  it("bloque au-delà de la limite puis libère", () => {
    const rl = createRateLimiter(2, 1000);
    expect(rl.check("ip", 0)).toBe(0);
    expect(rl.check("ip", 10)).toBe(0);
    expect(rl.check("ip", 20)).toBeGreaterThan(0);
    expect(rl.check("other", 20)).toBe(0);
    expect(rl.check("ip", 1500)).toBe(0);
  });
});

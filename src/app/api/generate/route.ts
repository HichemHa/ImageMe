import type { GenerateErrorResponse, GenerateResponse } from "@/lib/api-types";
import { buildPrompt } from "@/lib/prompt";
import { getImageProvider, ProviderError } from "@/lib/providers";
import { createRateLimiter } from "@/lib/rate-limit";
import { parseGenerationRequest } from "@/lib/selection";

export const maxDuration = 60;

const limiter = createRateLimiter(
  Number(process.env.RATE_LIMIT_PER_10_MIN) || 12,
  10 * 60 * 1000,
);

const TIMEOUT_MS = 55_000;

function fail(status: number, body: GenerateErrorResponse, headers?: HeadersInit) {
  return Response.json(body, { status, headers });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return fail(400, { error: "invalid", message: "Requête illisible." });
  }

  const parsed = parseGenerationRequest(payload);
  if (!parsed.ok) {
    return fail(400, { error: "invalid", message: parsed.error });
  }

  const provider = getImageProvider();

  if (!provider.isDemo) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "local";
    const wait = limiter.check(ip);
    if (wait > 0) {
      return fail(
        429,
        {
          error: "rate_limited",
          message: `Beaucoup d'images en peu de temps. Tu pourras continuer dans ${Math.ceil(wait / 60)} min.`,
        },
        { "Retry-After": String(wait) },
      );
    }
  }

  const { prompt, summary } = buildPrompt(parsed.value);

  try {
    const image = await provider.generate({
      prompt,
      request: parsed.value,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const body: GenerateResponse = {
      image: `data:${image.mimeType};base64,${image.base64}`,
      mimeType: image.mimeType,
      demo: provider.isDemo,
      provider: provider.id,
      prompt,
      summary,
      seed: parsed.value.seed,
    };
    return Response.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof ProviderError) {
      const status =
        err.code === "rate_limited" ? 429 : err.code === "rejected" ? 422 : 502;
      if (err.code === "config") console.error(`[generate] ${err.message}`);
      return fail(status, {
        error: err.code,
        message:
          err.code === "config"
            ? "La génération d'images n'est pas correctement configurée (clé ou identifiant de compte)."
            : err.message,
      });
    }
    if (err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError")) {
      return fail(504, {
        error: "timeout",
        message: "La création a pris trop de temps.",
      });
    }
    console.error("[generate] erreur inattendue", err);
    return fail(502, { error: "upstream", message: "La création n'a pas abouti." });
  }
}

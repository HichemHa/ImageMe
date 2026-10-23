import {
  errorFromResponse,
  ProviderError,
  type ImageProvider,
} from "./types";

/**
 * Fournisseur Cloudflare Workers AI (offre gratuite avec quota quotidien).
 * Variables : CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN (obligatoires),
 * CLOUDFLARE_IMAGE_MODEL (défaut : FLUX.1 schnell).
 */
export function createCloudflareProvider(env: NodeJS.ProcessEnv): ImageProvider {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const token = env.CLOUDFLARE_API_TOKEN;
  const model = env.CLOUDFLARE_IMAGE_MODEL || "@cf/black-forest-labs/flux-1-schnell";

  return {
    id: "cloudflare",
    isDemo: false,
    async generate({ prompt, signal }) {
      if (!accountId || !token) {
        throw new ProviderError(
          "config",
          "CLOUDFLARE_ACCOUNT_ID ou CLOUDFLARE_API_TOKEN manquant.",
        );
      }
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          // Le schéma de FLUX.1 schnell n'accepte que `prompt` et `steps` (max 8).
          body: JSON.stringify({
            prompt: prompt.slice(0, 2048),
            steps: 8,
          }),
          signal,
        },
      );
      if (!res.ok) throw await errorFromResponse("cloudflare", res);

      const json = (await res.json()) as {
        success?: boolean;
        result?: { image?: string };
      };
      const base64 = json.result?.image;
      if (!base64) {
        throw new ProviderError("upstream", "Réponse Cloudflare sans image.");
      }
      return { base64, mimeType: "image/jpeg" };
    },
  };
}

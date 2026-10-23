import {
  errorFromResponse,
  ProviderError,
  type ImageProvider,
} from "./types";

/**
 * Fournisseur OpenAI (API Images).
 * Variables : OPENAI_API_KEY (obligatoire), OPENAI_IMAGE_MODEL, OPENAI_IMAGE_QUALITY.
 */
export function createOpenAIProvider(env: NodeJS.ProcessEnv): ImageProvider {
  const apiKey = env.OPENAI_API_KEY;
  const model = env.OPENAI_IMAGE_MODEL || "gpt-image-1";
  const quality = env.OPENAI_IMAGE_QUALITY || "medium";

  return {
    id: "openai",
    isDemo: false,
    async generate({ prompt, signal }) {
      if (!apiKey) {
        throw new ProviderError("config", "OPENAI_API_KEY manquante.");
      }
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          prompt,
          size: "1024x1024",
          quality,
          n: 1,
        }),
        signal,
      });
      if (!res.ok) throw await errorFromResponse("openai", res);

      const json = (await res.json()) as { data?: { b64_json?: string }[] };
      const base64 = json.data?.[0]?.b64_json;
      if (!base64) {
        throw new ProviderError("upstream", "Réponse OpenAI sans image.");
      }
      return { base64, mimeType: "image/png" };
    },
  };
}

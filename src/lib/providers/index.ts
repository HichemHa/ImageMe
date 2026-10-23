import { createCloudflareProvider } from "./cloudflare";
import { createDemoProvider } from "./demo";
import { createOpenAIProvider } from "./openai";
import type { ImageProvider } from "./types";

export type ProviderId = "openai" | "cloudflare" | "demo";

/**
 * Choisit le fournisseur d'images à partir des variables d'environnement.
 *
 * - IMAGE_PROVIDER=openai | cloudflare | demo force un fournisseur ;
 * - sinon : Cloudflare si ses identifiants sont présents, puis OpenAI,
 *   et enfin le mode démonstration (clairement signalé dans l'interface).
 *
 * Ajouter un fournisseur : implémenter ImageProvider et l'enregistrer ici.
 */
export function resolveProviderId(env: NodeJS.ProcessEnv = process.env): ProviderId {
  const forced = env.IMAGE_PROVIDER?.trim().toLowerCase();
  if (forced === "openai" || forced === "cloudflare" || forced === "demo") {
    return forced;
  }
  if (env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_API_TOKEN) return "cloudflare";
  if (env.OPENAI_API_KEY) return "openai";
  return "demo";
}

export function getImageProvider(env: NodeJS.ProcessEnv = process.env): ImageProvider {
  switch (resolveProviderId(env)) {
    case "openai":
      return createOpenAIProvider(env);
    case "cloudflare":
      return createCloudflareProvider(env);
    default:
      return createDemoProvider();
  }
}

export { ProviderError } from "./types";
export type { ImageProvider } from "./types";

import type { GenerationRequest } from "../selection";

export interface GenerateInput {
  prompt: string;
  request: GenerationRequest;
  signal?: AbortSignal;
}

export interface GeneratedImage {
  /** Image encodée en base64. */
  base64: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml";
}

export interface ImageProvider {
  id: string;
  /** Vrai si l'image n'est PAS produite par une IA (mode démonstration). */
  isDemo: boolean;
  generate(input: GenerateInput): Promise<GeneratedImage>;
}

export type ProviderErrorCode =
  | "config"
  | "rejected"
  | "rate_limited"
  | "timeout"
  | "upstream";

/** Erreur normalisée renvoyée par un fournisseur, sans détail sensible. */
export class ProviderError extends Error {
  constructor(
    public code: ProviderErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

/** Convertit une réponse HTTP en erreur de fournisseur. */
export async function errorFromResponse(
  provider: string,
  res: Response,
): Promise<ProviderError> {
  let detail = "";
  try {
    detail = (await res.text()).slice(0, 500);
  } catch {
    // ignoré
  }
  // Journalisé côté serveur uniquement, jamais renvoyé au navigateur.
  console.error(`[${provider}] HTTP ${res.status}: ${detail}`);

  if (res.status === 401 || res.status === 403) {
    return new ProviderError("config", "Clé du fournisseur d'images invalide.");
  }
  if (res.status === 429) {
    return new ProviderError("rate_limited", "Le fournisseur d'images est saturé.");
  }
  if (res.status === 400 && /safety|policy|moderation|nsfw/i.test(detail)) {
    return new ProviderError("rejected", "Le fournisseur a refusé cette image.");
  }
  return new ProviderError("upstream", "Le fournisseur d'images n'a pas répondu correctement.");
}

/** Contrat de l'API /api/generate, partagé entre serveur et navigateur. */

export interface GenerateResponse {
  image: string;
  mimeType: string;
  demo: boolean;
  provider: string;
  prompt: string;
  summary: string[];
  seed: number;
}

export interface GenerateErrorResponse {
  error: "invalid" | "rate_limited" | "rejected" | "timeout" | "config" | "upstream";
  message: string;
}

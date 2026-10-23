/**
 * Limiteur de débit en mémoire (fenêtre glissante), pour protéger les
 * crédits du fournisseur d'images.
 *
 * Best effort : sur un hébergement serverless, chaque instance a sa propre
 * mémoire. Suffisant pour un MVP ; à remplacer par un stockage partagé
 * (Redis, KV…) si l'usage grandit.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();

  return {
    /** Renvoie le nombre de secondes à attendre, ou 0 si autorisé. */
    check(key: string, now = Date.now()): number {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return Math.ceil((windowMs - (now - recent[0])) / 1000);
      }
      recent.push(now);
      hits.set(key, recent);
      // Nettoyage opportuniste pour éviter que la Map ne grossisse.
      if (hits.size > 5000) {
        for (const [k, v] of hits) {
          if (v.every((t) => now - t >= windowMs)) hits.delete(k);
        }
      }
      return 0;
    },
  };
}

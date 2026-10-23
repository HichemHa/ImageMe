# Sans Mots — donner une forme aux émotions

> « Tu n'as pas besoin de trouver les mots. Explore ce que tu ressens et donne-lui une forme. »

Une application web qui aide à exprimer un ressenti **sans avoir à l'expliquer** :
l'utilisateur choisit intuitivement un point de départ, une forme, des couleurs, une
matière et une atmosphère. L'IA compose ensuite une image artistique à partir de ces
choix. L'image peut alors être ajustée, téléchargée, partagée volontairement, ou
gardée dans une collection privée.

*« Sans Mots » est un nom de travail. Il se change dans `src/lib/site.ts`. Sa
disponibilité juridique et commerciale n'a pas été vérifiée.*

---

## Démarrage rapide

Prérequis : Node.js 20.9 ou plus récent (22 recommandé).

```bash
npm install
npm run dev          # http://localhost:3000
```

Sans clé API, l'application démarre en **mode démonstration**. Les images sont alors
dessinées de façon procédurale par le serveur (SVG), sans IA. Un badge
« Mode démonstration · sans IA » le signale sur chaque image.

### Activer la génération réelle par IA

```bash
cp .env.example .env.local
# puis renseigner UN des fournisseurs ci-dessous
```

| Fournisseur | Coût | Variables |
|---|---|---|
| **Cloudflare Workers AI** (FLUX.1 schnell) | **Gratuit** dans la limite d'un quota quotidien | `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` |
| **OpenAI** (`gpt-image-1`) | Payant à l'image | `OPENAI_API_KEY` |

Le fournisseur est détecté automatiquement, dans cet ordre : Cloudflare, puis OpenAI,
puis le mode démonstration. `IMAGE_PROVIDER=cloudflare|openai|demo` permet de le forcer.

**Obtenir les identifiants Cloudflare (gratuit)**
1. Créer un compte sur <https://dash.cloudflare.com> (inutile de créer une « app »).
2. **Account ID** : menu du compte → *Account details* (il figure aussi dans l'URL du tableau de bord).
3. **API Token** : *My Profile → API Tokens → Create Token*. Utiliser le modèle
   « Workers AI », ou un jeton personnalisé avec la permission *Account · Workers AI · Read*.

Les clés restent **côté serveur**, dans les variables d'environnement. Elles ne sont
jamais envoyées au navigateur : ne pas les préfixer par `NEXT_PUBLIC_`.

---

## Hébergement gratuit (Vercel + Cloudflare)

1. Pousser ce dépôt sur GitHub.
2. Sur <https://vercel.com>, créer un compte gratuit (plan *Hobby*), puis
   *Add New → Project* et importer le dépôt. Next.js est détecté automatiquement.
3. Dans *Settings → Environment Variables*, ajouter `CLOUDFLARE_ACCOUNT_ID` et
   `CLOUDFLARE_API_TOKEN`, puis redéployer.
4. Chaque `git push` redéploie le site automatiquement.

Points à connaître :
- Le plan Hobby de Vercel est réservé à un usage **non commercial**.
- Aucune base de données n'est nécessaire.
- La limite de débit intégrée (`RATE_LIMIT_PER_10_MIN`, 12 par défaut et par adresse
  IP) protège le quota gratuit. Elle est approximative en serverless : chaque instance
  a sa propre mémoire.

Tout hébergeur compatible Next.js fonctionne aussi (`npm run build && npm start`).

---

## Décisions techniques

- **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4.** Les pages sont statiques,
  avec une seule route serveur (`POST /api/generate`).
- **Pas de base de données ni d'authentification.** Le MVP n'en a pas besoin.
- **Fournisseurs interchangeables.** Ils implémentent l'interface `ImageProvider`
  (`src/lib/providers/`). Ajouter un fournisseur revient à écrire un fichier et à
  l'enregistrer dans `providers/index.ts`.
- **Aucun texte libre envoyé à l'IA.** Le navigateur n'envoie que des identifiants
  issus du catalogue (`src/lib/options.ts`), et le serveur les valide strictement
  (`parseGenerationRequest`). Cela protège la vie privée, empêche l'injection de prompt
  et limite les abus.
- **Prompt construit côté serveur** (`src/lib/prompt.ts`), dans cet ordre : style →
  sujet → ressenti suggéré (jamais littéral) → matière → palette → atmosphère →
  composition → intensité → garde-fous (pas de texte, pas de visage reconnaissable,
  pas de clichés émotionnels). Ce qui n'a pas été choisi reste ouvert : rien n'est inventé.
- **Hasard reproductible.** « Laisser le hasard choisir » est résolu avec une graine,
  et l'écran de résultat indique ce que le hasard a choisi.
- **Stockage local uniquement.** Les choix en cours vivent dans `sessionStorage` et
  disparaissent à la fermeture de l'onglet. La collection est **désactivée par défaut**
  et stockée en IndexedDB, dans le navigateur.
- **Partage** via la feuille de partage native (Web Share API) : l'image va de
  l'appareil à l'application choisie sans passer par le serveur. Si le navigateur ne
  la prend pas en charge, l'application propose de télécharger l'image.
- **Une seule dépendance ajoutée :** `vitest`, pour les tests.

## Choix UX

- **Peu de texte, tutoiement, ton doux.** Aucun écran ne ressemble à un questionnaire.
- **Toujours une issue.** Chaque étape propose « Passer » (ou « Je ne sais pas ») et
  « Laisser le hasard choisir ». Ne rien choisir du tout fonctionne aussi.
- **Récapitulatif modifiable** avant la création, avec un style facultatif
  (« Surprends-moi » par défaut).
- **Réactions sans justification.** « Cette image me ressemble », « C'est proche… »
  (ajustements facultatifs : plus doux, plus lumineux, plus d'espace…), « Une autre
  direction » (changer ses choix, ou laisser le hasard proposer) et « Je ne sais pas
  encore ». On peut revenir à l'image précédente.
- **Ambiance réactive.** Le fond lumineux prend les couleurs choisies.
- **Accessibilité.** Vrais boutons radio (navigation au clavier), focus visible,
  focus déplacé sur le titre à chaque étape, régions `aria-live`, contrastes élevés,
  `prefers-reduced-motion` respecté, `lang="fr"`.

## Confidentialité et sécurité émotionnelle

- Aucune donnée personnelle demandée, aucun compte.
- Seuls les choix (sous forme de mots-clés) sont transmis au fournisseur d'IA. La
  description envoyée est consultable sous chaque image.
- Le serveur ne conserve ni les choix ni les images.
- Rien n'est partagé automatiquement.
- L'application ne pose aucun diagnostic. Le pied de page oriente vers un·e
  professionnel·le ou les services d'urgence. La page `/confidentialite` explique tout
  cela en clair.

---

## Scripts

```bash
npm run dev        # développement
npm run build      # build de production
npm start          # serveur de production
npm test           # tests unitaires et d'API (Vitest)
npm run lint       # ESLint
npm run typecheck  # TypeScript
```

Les tests couvrent le générateur de prompts, la résolution du hasard, la validation
stricte des requêtes, la sélection du fournisseur, les fournisseurs OpenAI et
Cloudflare (réponses HTTP simulées), le rendu du mode démonstration (toutes les
combinaisons), la route `/api/generate` et le limiteur de débit.

## Structure

```
src/
  app/
    page.tsx                 accueil
    creer/page.tsx           parcours de création
    collection/page.tsx      collection privée (sur l'appareil)
    confidentialite/page.tsx ce qui est transmis, ce qui reste
    api/generate/route.ts    génération (validation, limite de débit, erreurs)
  components/
    experience/              étapes, récapitulatif, attente, résultat
    ChoiceGrid, OptionVisual, ImageActions, AmbientBackground, …
  lib/
    options.ts               catalogue des choix et fragments de prompt
    selection.ts             hasard, validation des requêtes
    prompt.ts                générateur de prompts artistiques
    providers/               openai, cloudflare, demo (+ interface commune)
    collection.ts            IndexedDB (collection privée)
    image-utils.ts           téléchargement / partage (SVG → PNG)
tests/                       Vitest
```

## Hors du périmètre du MVP (volontairement)

Pas de réseau social, de profils publics, de likes, de suivi émotionnel, d'analyse
psychologique, ni d'abonnement.

Pistes pour la suite : stockage partagé pour la limite de débit (KV/Redis), tests
end-to-end automatisés, choix multiples par étape, traduction de l'interface.

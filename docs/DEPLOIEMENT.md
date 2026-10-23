# Déploiement gratuit : Vercel + Cloudflare Workers AI

Temps estimé : 10 minutes. Coût : 0 €.

- **Vercel** (plan *Hobby*) héberge le site et la route serveur.
- **Cloudflare Workers AI** génère les images (modèle FLUX.1 schnell, quota gratuit
  quotidien).

> Le plan Hobby de Vercel est réservé à un usage **non commercial**.

## 1. Créer le jeton Cloudflare

Inutile de créer une « app » ou un Worker sur Cloudflare : seuls un identifiant de
compte et un jeton sont nécessaires.

1. Se connecter à <https://dash.cloudflare.com>.
2. Aller dans **Manage account → Account API tokens → Create token**.
3. **Token name :** par exemple `imageme-vercel`.
4. **Permission policies → Start from scratch**, puis dans
   **AI & Machine Learning → Workers AI**, cocher **Read** et **Edit**. Ne rien cocher
   d'autre, et ne jamais choisir « Full account access » ni « Write all resources ».
5. **Token expiration :** 1 an (recommandé).
6. **Client IP address filtering :** laisser **vide**, car les adresses de Vercel
   changent.
7. **Create token**, puis **copier le jeton immédiatement** : il n'est affiché qu'une
   fois.

**Account ID :** c'est le long code visible dans l'URL du tableau de bord
(`dash.cloudflare.com/<ACCOUNT_ID>/…`). Il apparaît aussi sur la page de création du
jeton.

> 🔐 Le jeton est un secret. Il ne se colle que dans Vercel : jamais dans le code, une
> issue ou une conversation. S'il a fuité, supprimez-le dans Cloudflare et créez-en un
> nouveau.

## 2. Importer le projet dans Vercel

1. Créer un compte sur <https://vercel.com> avec GitHub.
2. **Add New → Project**, puis importer le dépôt `ImageMe`.
3. Laisser les réglages détectés : *Framework : Next.js*, *Root Directory : `./`*.
4. Ouvrir **Environment Variables** et ajouter :

   | Clé | Valeur |
   |---|---|
   | `CLOUDFLARE_ACCOUNT_ID` | l'Account ID |
   | `CLOUDFLARE_API_TOKEN` | le jeton (commence par `cfat_`) |

5. **Deploy.** Le build prend 1 à 2 minutes.

> L'avertissement `npm warn Unknown env config "cache-dir"` dans les logs de build vient
> de Vercel et peut être ignoré.

## 3. Vérifier

1. Ouvrir l'URL du projet (`https://<projet>.vercel.app`).
2. Faire un parcours complet jusqu'à l'image.
3. Le badge **« Mode démonstration · sans IA »** ne doit **pas** apparaître.
4. La page `/confidentialite` doit indiquer *Cloudflare Workers AI* comme service
   d'images.

Ensuite, chaque `git push` sur `main` redéploie automatiquement le site.

## Modifier une variable

Dans **Settings → Environment Variables**, modifier la valeur, puis aller dans
**Deployments → ⋯ → Redeploy**. Les variables ne sont lues qu'au déploiement.

## Diagnostic

| Ce qui s'affiche | Cause probable | Solution |
|---|---|---|
| Badge « Mode démonstration » | Variables absentes ou mal nommées | Vérifier les noms exacts, puis redéployer |
| « …n'est pas correctement configurée (clé ou identifiant de compte) » | Jeton invalide ou expiré, permissions manquantes, Account ID erroné | Recréer le jeton (Workers AI : Read + Edit) et vérifier l'Account ID |
| « …n'a pas répondu correctement (code 4xx/5xx) » | Erreur renvoyée par Cloudflare | Consulter les logs (voir ci-dessous) |
| « Beaucoup d'images en peu de temps… » | Limite intégrée atteinte | Attendre, ou augmenter `RATE_LIMIT_PER_10_MIN` |
| « La création a pris trop de temps. » | Fournisseur lent | Réessayer |

**Lire les logs :** dans Vercel, ouvrir le projet, puis l'onglet **Logs**, et filtrer
sur `/api/generate`. La ligne `[cloudflare] HTTP <code>: …` contient la réponse exacte
du fournisseur. Elle n'est jamais montrée aux visiteurs.

## Utiliser OpenAI à la place

Ajouter `OPENAI_API_KEY`, et éventuellement `IMAGE_PROVIDER=openai` si les variables
Cloudflare sont aussi présentes. OpenAI est payant à l'image.

## Autres hébergeurs

N'importe quel hébergeur compatible Node.js fonctionne :

```bash
npm ci
npm run build
npm start            # port 3000 par défaut, PORT=8080 npm start pour changer
```

En serverless, prévoir une durée d'exécution d'au moins 60 s pour `/api/generate`.

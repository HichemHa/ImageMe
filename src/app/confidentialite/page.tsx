import type { Metadata } from "next";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ButtonLink } from "@/components/Button";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { resolveProviderId } from "@/lib/providers";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Confidentialité",
};

const PROVIDER_TEXT = {
  cloudflare:
    "Cloudflare Workers AI (modèle FLUX). La description est envoyée à Cloudflare pour produire l'image.",
  openai:
    "OpenAI (API Images). La description est envoyée à OpenAI pour produire l'image.",
  demo: "Aucun : l'application fonctionne actuellement en mode démonstration, les images sont dessinées par notre serveur sans IA et rien n'est transmis à un tiers.",
};

export default function PrivacyPage() {
  const provider = resolveProviderId();
  return (
    <>
      <AmbientBackground intensity={0.5} />
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-5 pb-10 pt-4 sm:px-8">
        <h1 className="font-serif text-3xl sm:text-4xl">Ce qui reste à toi</h1>
        <p className="mt-4 text-lg text-muted">
          {SITE_NAME} touche à des choses intimes. Voici, simplement, ce qui se passe
          avec tes choix et tes images.
        </p>

        <div className="mt-10 space-y-8 leading-relaxed text-paper/85">
          <section>
            <h2 className="font-serif text-xl text-paper">Pas de compte, pas de profil</h2>
            <p className="mt-2 text-muted">
              Aucune inscription, aucun nom, aucune adresse e-mail. Nous ne te
              demandons pas de raconter ton histoire.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-paper">Ce qui est transmis pour créer une image</h2>
            <p className="mt-2 text-muted">
              Uniquement tes choix (une forme, une couleur, une matière, une
              atmosphère…), traduits en une courte description artistique. Aucune
              donnée personnelle n&apos;est demandée. Tu peux lire cette description
              sous chaque image.
            </p>
            <p className="mt-2 text-muted">
              Si tu choisis « Autre… » pour t&apos;exprimer avec tes propres mots,
              ces quelques mots (120 caractères au plus) font partie de la
              description. Écrits dans une autre langue que l&apos;anglais, ils sont
              d&apos;abord traduits par un modèle de langue du même fournisseur.
              Mieux vaut éviter d&apos;y mettre des noms ou des informations
              personnelles.
            </p>
            <p className="mt-2 text-muted">
              Service d&apos;images utilisé :{" "}
              <span className="text-paper/90">{PROVIDER_TEXT[provider]}</span>
            </p>
            <p className="mt-2 text-muted">
              Notre serveur ne garde ni tes choix ni tes images : il les transmet
              puis les oublie. Le fournisseur d&apos;IA applique sa propre politique
              de conservation.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-paper">Ce qui reste sur ton appareil</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
              <li>
                Tes choix en cours, le temps de l&apos;onglet (ils disparaissent à
                sa fermeture).
              </li>
              <li>
                Ta collection, seulement si tu l&apos;actives : elle est stockée dans
                ce navigateur et tu peux l&apos;effacer à tout moment.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-paper">Partager, seulement si tu le choisis</h2>
            <p className="mt-2 text-muted">
              Rien n&apos;est partagé automatiquement. Quand tu partages, l&apos;image
              part directement de ton appareil vers la personne de ton choix.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-paper">Ce que l&apos;application ne fait pas</h2>
            <p className="mt-2 text-muted">
              Elle ne devine pas tes émotions, ne pose aucun diagnostic et ne
              remplace pas un·e professionnel·le de santé. Les images sont des
              propositions : c&apos;est toi qui décides de ce qu&apos;elles veulent dire.
            </p>
          </section>
        </div>

        <ButtonLink href="/creer" className="mt-12">
          Commencer
        </ButtonLink>
      </main>
      <SiteFooter />
    </>
  );
}

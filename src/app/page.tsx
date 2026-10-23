import { AmbientBackground } from "@/components/AmbientBackground";
import { ButtonLink } from "@/components/Button";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function Home() {
  return (
    <>
      <AmbientBackground />
      <SiteHeader />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
        <p className="animate-rise text-xs uppercase tracking-[0.3em] text-faint">
          Un espace pour ce qui reste à l&apos;intérieur
        </p>
        <h1
          className="animate-rise mt-8 max-w-3xl font-serif text-4xl leading-[1.12] text-paper sm:text-6xl"
          style={{ animationDelay: "120ms" }}
        >
          Tu n&apos;as pas besoin de trouver les mots.
        </h1>
        <p
          className="animate-rise mt-6 max-w-xl font-serif text-xl italic text-paper/75 sm:text-2xl"
          style={{ animationDelay: "260ms" }}
        >
          Explore ce que tu ressens et donne-lui une forme.
        </p>
        <div className="animate-rise mt-12" style={{ animationDelay: "420ms" }}>
          <ButtonLink href="/creer" className="px-10 py-4 text-base">
            Commencer
          </ButtonLink>
        </div>

        <ul
          className="animate-rise mt-20 grid max-w-3xl gap-8 text-left text-sm text-muted sm:grid-cols-3"
          style={{ animationDelay: "600ms" }}
        >
          <li>
            <span className="block font-serif text-lg text-paper/90">Sans raconter</span>
            Des formes, des couleurs, des matières. Aucune histoire à écrire.
          </li>
          <li>
            <span className="block font-serif text-lg text-paper/90">Sans juger</span>
            Pas de bonne réponse. « Je ne sais pas » est toujours possible.
          </li>
          <li>
            <span className="block font-serif text-lg text-paper/90">Sans compte</span>
            Tes créations restent à toi. Rien n&apos;est partagé sans ton geste.
          </li>
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}

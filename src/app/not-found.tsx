import { ButtonLink } from "@/components/Button";
import { SiteHeader } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 text-center">
        <h1 className="font-serif text-3xl">Cette page n&apos;existe pas.</h1>
        <p className="mt-3 text-muted">Ce n&apos;est pas grave.</p>
        <ButtonLink href="/" className="mt-8">
          Revenir à l&apos;accueil
        </ButtonLink>
      </main>
    </>
  );
}

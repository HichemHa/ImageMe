import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Link
        href="/"
        className="font-serif text-lg italic tracking-wide text-paper/90 hover:text-paper"
      >
        {SITE_NAME}
      </Link>
      <nav aria-label="Navigation principale" className="flex items-center gap-1 text-sm">
        <Link href="/collection" className="rounded-full px-3 py-2 text-muted transition hover:text-paper">
          Ma collection
        </Link>
        <Link href="/confidentialite" className="rounded-full px-3 py-2 text-muted transition hover:text-paper">
          Confidentialité
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-8 pt-12 text-xs leading-relaxed text-faint sm:px-8">
      <p className="max-w-2xl">
        {SITE_NAME} est un espace d&apos;expression personnelle. Les images ne sont
        ni un diagnostic ni un soin. Si tu traverses un moment très difficile,
        parler à un·e professionnel·le de santé ou à une ligne d&apos;écoute peut
        aider ; en cas d&apos;urgence, contacte les services d&apos;urgence de ton pays.
      </p>
    </footer>
  );
}

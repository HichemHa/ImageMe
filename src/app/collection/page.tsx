import type { Metadata } from "next";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CollectionView } from "@/components/CollectionView";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Ma collection",
  robots: { index: false },
};

export default function CollectionPage() {
  return (
    <>
      <AmbientBackground intensity={0.6} />
      <SiteHeader />
      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-5 pb-10 pt-4 sm:px-8">
        <h1 className="font-serif text-3xl sm:text-4xl">Ma collection</h1>
        <p className="mt-3 max-w-xl text-muted">
          Uniquement sur cet appareil, dans ce navigateur. Personne d&apos;autre ne
          la voit.
        </p>
        <CollectionView />
      </main>
      <SiteFooter />
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Button } from "../Button";

const LINES = [
  "Ton image prend forme…",
  "Les couleurs se déposent…",
  "La matière se dessine…",
  "Encore un instant…",
];

export function GeneratingView({ onCancel }: { onCancel: () => void }) {
  const [line, setLine] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setLine((l) => Math.min(l + 1, LINES.length - 1)), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      className="animate-rise flex min-h-[60vh] flex-col items-center justify-center text-center"
      aria-busy="true"
    >
      <div aria-hidden className="relative h-48 w-48 sm:h-56 sm:w-56">
        <div className="animate-breathe absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--amb-2)_0%,var(--amb-1)_45%,transparent_70%)] blur-xl" />
        <div
          className="animate-breathe absolute inset-8 rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.6)_0%,var(--amb-3)_50%,transparent_75%)] blur-md"
          style={{ animationDelay: "-2.5s" }}
        />
      </div>
      <p role="status" aria-live="polite" className="mt-10 font-serif text-2xl italic text-paper/90">
        {LINES[line]}
      </p>
      <p className="mt-3 text-sm text-faint">Cela peut prendre jusqu&apos;à une minute.</p>
      <Button variant="ghost" onClick={onCancel} className="mt-8">
        Annuler
      </Button>
    </section>
  );
}

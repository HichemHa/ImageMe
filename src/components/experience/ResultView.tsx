"use client";

/* eslint-disable @next/next/no-img-element -- images en data URL générées à la volée */

import { useEffect, useRef, useState } from "react";
import { ADJUSTMENTS, findOption, type CategoryId } from "@/lib/options";
import { Button } from "../Button";
import { ImageActions } from "../ImageActions";
import type { Creation } from "./types";

type Reaction = "resonates" | "close" | "elsewhere" | "unsure";

const REACTIONS: { id: Reaction; label: string }[] = [
  { id: "resonates", label: "Cette image me ressemble." },
  { id: "close", label: "C'est proche, mais pas exactement ça." },
  { id: "elsewhere", label: "Je veux explorer une autre direction." },
  { id: "unsure", label: "Je ne sais pas encore." },
];

const CATEGORY_NAMES: Partial<Record<CategoryId, string>> = {
  feeling: "le point de départ",
  shape: "la forme",
  color: "les couleurs",
  texture: "la matière",
  atmosphere: "l'atmosphère",
  style: "le style",
};

export function ResultView({
  creation,
  hasPrevious,
  onVariation,
  onSurprise,
  onEdit,
  onRestart,
  onPrevious,
}: {
  creation: Creation;
  hasPrevious: boolean;
  onVariation: (adjustments: string[]) => void;
  onSurprise: () => void;
  onEdit: () => void;
  onRestart: () => void;
  onPrevious: () => void;
}) {
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [adjustments, setAdjustments] = useState<string[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Le parent remonte ce composant (key) à chaque nouvelle image.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const toggleAdjustment = (id: string) =>
    setAdjustments((list) =>
      list.includes(id) ? list.filter((a) => a !== id) : [...list, id].slice(-3),
    );

  const randomNames = (Object.keys(creation.randomPicks) as CategoryId[])
    .map((c) => {
      const choice = creation.choices[c as keyof typeof creation.choices];
      const option = typeof choice === "string" ? findOption(c, choice) : undefined;
      return option ? `${CATEGORY_NAMES[c]} (${option.label.toLowerCase()})` : null;
    })
    .filter(Boolean);

  return (
    <section aria-labelledby="result-title" className="animate-rise">
      <h1 id="result-title" ref={headingRef} tabIndex={-1} className="sr-only">
        Ton image
      </h1>

      <figure className="mx-auto w-full max-w-[min(640px,100%)]">
        <div className="relative overflow-hidden rounded-[28px] shadow-[0_40px_120px_-30px_rgb(0_0_0/0.8),0_0_0_1px_rgb(255_255_255/0.06)]">
          <img
            key={creation.id}
            src={creation.image}
            alt="Image créée à partir de tes choix. Elle n'a pas de sens imposé : à toi d'y reconnaître ce qui te parle."
            width={1024}
            height={1024}
            className="animate-reveal block aspect-square w-full object-cover"
          />
          {creation.demo && (
            <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-paper/90 backdrop-blur">
              Mode démonstration · sans IA
            </span>
          )}
        </div>
        <figcaption className="mt-4 flex flex-wrap justify-center gap-1.5">
          {creation.summary.map((s) => (
            <span key={s} className="rounded-full border border-line px-3 py-1 text-xs text-muted">
              {s}
            </span>
          ))}
        </figcaption>
        {randomNames.length > 0 && (
          <p className="mt-2 text-center text-xs text-faint">
            Le hasard a choisi {randomNames.join(", ")}.
          </p>
        )}
      </figure>

      <div className="mx-auto mt-10 max-w-2xl text-center">
        <h2 className="font-serif text-2xl text-paper/95">Comment la reçois-tu ?</h2>
        <p className="mt-1 text-sm text-faint">Rien à expliquer. Juste ce qui vient.</p>
        <div role="group" aria-label="Ta réaction à l'image" className="mt-5 grid gap-2 sm:grid-cols-2">
          {REACTIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={reaction === r.id}
              onClick={() => setReaction(r.id)}
              className={`rounded-2xl border px-4 py-3 text-left font-serif text-[1.02rem] transition duration-300 ${
                reaction === r.id
                  ? "border-paper/60 bg-white/[0.09] text-paper"
                  : "border-line bg-white/[0.02] text-paper/80 hover:border-paper/30 hover:bg-white/[0.05]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div aria-live="polite" className="mt-6">
          {reaction === "resonates" && (
            <p className="animate-rise font-serif text-lg italic text-paper/85">
              Elle est à toi. Tu peux la garder, la télécharger, ou la montrer à
              quelqu&apos;un — seulement si tu le souhaites.
            </p>
          )}

          {reaction === "close" && (
            <div className="animate-rise rounded-2xl border border-line bg-white/[0.02] p-5">
              <p className="text-sm text-muted">
                Si tu veux, indique une direction. Sinon, une simple variation.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {ADJUSTMENTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={adjustments.includes(a.id)}
                    onClick={() => toggleAdjustment(a.id)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      adjustments.includes(a.id)
                        ? "border-paper/60 bg-white/10 text-paper"
                        : "border-line text-muted hover:border-paper/30 hover:text-paper"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {hasPrevious && (
                  <Button variant="ghost" onClick={onPrevious}>
                    Revoir l&apos;image précédente
                  </Button>
                )}
                <Button onClick={() => onVariation(adjustments)}>
                  {adjustments.length ? "Ajuster l'image" : "Créer une variation"}
                </Button>
              </div>
            </div>
          )}

          {reaction === "elsewhere" && (
            <div className="animate-rise flex flex-wrap justify-center gap-2">
              <Button variant="secondary" onClick={onEdit}>
                Changer mes choix
              </Button>
              <Button onClick={onSurprise}>Laisser le hasard proposer autre chose</Button>
            </div>
          )}

          {reaction === "unsure" && (
            <p className="animate-rise font-serif text-lg italic text-paper/85">
              Rien ne presse. Tu peux la regarder encore un peu, la garder pour
              plus tard, ou simplement passer à autre chose.
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-2xl border-t border-line pt-8">
        <ImageActions
          item={{
            id: creation.id,
            image: creation.image,
            mimeType: creation.mimeType,
            summary: creation.summary,
            demo: creation.demo,
            createdAt: creation.createdAt,
          }}
        />
        <div className="mt-4 flex justify-center">
          <Button variant="ghost" onClick={onRestart}>
            Recommencer une création
          </Button>
        </div>

        <details className="group mx-auto mt-8 max-w-xl text-sm text-faint">
          <summary className="cursor-pointer list-none text-center hover:text-muted">
            {creation.demo
              ? "Voir la description qui serait envoyée à l'IA"
              : "Voir la description envoyée à l'IA"}
          </summary>
          <p className="mt-3 rounded-xl border border-line bg-black/20 p-4 font-mono text-xs leading-relaxed text-muted">
            {creation.prompt}
          </p>
          <p className="mt-2 text-xs">
            Seuls tes choix (et tes mots, si tu en as écrit) sont transmis, puis
            oubliés. Aucune donnée personnelle n&apos;est demandée.
          </p>
        </details>
      </div>
    </section>
  );
}

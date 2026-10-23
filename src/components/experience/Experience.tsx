"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { GenerateErrorResponse, GenerateResponse } from "@/lib/api-types";
import { findColor } from "@/lib/options";
import { randomSeed } from "@/lib/rng";
import {
  EMPTY_SELECTION,
  RANDOM,
  resolveSelection,
  type Choice,
  type RandomPicks,
  type ResolvedChoices,
  type Selection,
} from "@/lib/selection";
import { AmbientBackground } from "../AmbientBackground";
import { Button } from "../Button";
import { GeneratingView } from "./GeneratingView";
import { RecapView } from "./RecapView";
import { ResultView } from "./ResultView";
import { StepView } from "./StepView";
import { RECAP_STEP, STEPS } from "./steps";
import type { Creation } from "./types";

type Phase =
  | { kind: "explore"; step: number }
  | { kind: "generating"; from: Phase }
  | { kind: "result" }
  | { kind: "error"; message: string; retry: () => void; from: Phase };

/** Les choix restent dans l'onglet (sessionStorage) et disparaissent à sa fermeture. */
const STORAGE_KEY = "sans-mots:journey";

interface Stored {
  selection: Selection;
  step: number;
}

function readStored(): Stored | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Stored;
    if (typeof parsed.step !== "number" || !parsed.selection) return null;
    return {
      selection: { ...EMPTY_SELECTION, ...parsed.selection },
      step: Math.max(0, Math.min(parsed.step, RECAP_STEP)),
    };
  } catch {
    return null;
  }
}

const ERROR_MESSAGES: Record<GenerateErrorResponse["error"], string> = {
  invalid: "Quelque chose dans la demande n'allait pas.",
  rate_limited: "Beaucoup d'images en peu de temps. Laisse passer quelques minutes.",
  rejected:
    "Le service d'images n'a pas pu créer celle-ci. Essaie une autre combinaison, ou simplement de nouveau.",
  timeout: "La création a pris trop de temps.",
  config: "La création d'images n'est pas disponible pour le moment.",
  upstream: "Le service d'images ne répond pas comme prévu.",
};

export function Experience() {
  // Composant rendu uniquement côté navigateur : on peut lire le parcours
  // en cours directement (rechargement de page).
  const [initial] = useState(readStored);
  const [selection, setSelection] = useState<Selection>(
    initial?.selection ?? EMPTY_SELECTION,
  );
  const [phase, setPhase] = useState<Phase>({ kind: "explore", step: initial?.step ?? 0 });
  const [creations, setCreations] = useState<Creation[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const step = phase.kind === "explore" ? phase.step : RECAP_STEP;
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ selection, step } satisfies Stored));
    } catch {
      // stockage indisponible : le parcours fonctionne quand même
    }
  }, [selection, step]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [phase.kind, step]);

  const current = creations[0];

  async function generate(
    choices: ResolvedChoices,
    randomPicks: RandomPicks,
    adjustments: string[],
    from: Phase,
  ) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const seed = randomSeed();
    setPhase({ kind: "generating", from });

    const retry = () => void generate(choices, randomPicks, adjustments, from);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choices, adjustments, seed }),
        signal: controller.signal,
      });
      const json = (await res.json().catch(() => null)) as
        | GenerateResponse
        | GenerateErrorResponse
        | null;

      if (!res.ok || !json || "error" in json) {
        const err = json && "error" in json ? json : null;
        const message =
          err?.error === "rate_limited"
            ? err.message
            : err
              ? ERROR_MESSAGES[err.error]
              : "La création n'a pas abouti.";
        setPhase({ kind: "error", message, retry, from });
        return;
      }

      const creation: Creation = {
        ...json,
        id: crypto.randomUUID(),
        choices,
        adjustments,
        randomPicks,
        createdAt: Date.now(),
      };
      setCreations((list) => [creation, ...list].slice(0, 5));
      setPhase({ kind: "result" });
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error(err);
      setPhase({
        kind: "error",
        message: "La connexion semble interrompue.",
        retry,
        from,
      });
    }
  }

  const cancel = () => {
    abortRef.current?.abort();
    if (phase.kind === "generating") setPhase(phase.from);
  };

  const setChoice = (category: keyof Selection, value: Choice) =>
    setSelection((s) => ({ ...s, [category]: value }));

  const goTo = (next: number) => setPhase({ kind: "explore", step: next });

  const createFromSelection = () => {
    const { choices, randomPicks } = resolveSelection(selection);
    void generate(choices, randomPicks, [], { kind: "explore", step: RECAP_STEP });
  };

  const surprise = () => {
    // Garde le point de départ (il appartient à l'utilisateur), rebat le reste.
    const next: Selection = {
      ...selection,
      shape: RANDOM,
      color: RANDOM,
      texture: RANDOM,
      atmosphere: RANDOM,
      style: RANDOM,
    };
    const { choices, randomPicks } = resolveSelection(next);
    setSelection({
      feeling: selection.feeling,
      shape: choices.shape,
      color: choices.color,
      texture: choices.texture,
      atmosphere: choices.atmosphere,
      style: selection.style,
    });
    void generate(choices, randomPicks, [], { kind: "result" });
  };

  const restart = () => {
    setSelection(EMPTY_SELECTION);
    setCreations([]);
    setPhase({ kind: "explore", step: 0 });
  };

  // Couleurs d'ambiance : celles choisies, ou celles de l'image affichée.
  const ambientColor =
    phase.kind === "result" && current
      ? current.choices.color
      : selection.color !== RANDOM
        ? selection.color
        : null;
  const palette = findColor(ambientColor)?.palette;

  return (
    <>
      <AmbientBackground palette={palette} intensity={phase.kind === "result" ? 0.7 : 1} />
      <main
        id="contenu"
        className={`relative z-10 mx-auto w-full flex-1 px-5 pb-16 pt-4 sm:px-8 ${phase.kind === "result" ? "max-w-4xl" : "max-w-3xl"}`}
      >
        {phase.kind === "explore" && phase.step < RECAP_STEP ? (
          <StepView
            stepIndex={phase.step}
            value={selection[STEPS[phase.step].category]}
            onChoose={(id) => setChoice(STEPS[phase.step].category, id)}
            onNext={() => goTo(phase.step + 1)}
            onBack={() => (phase.step === 0 ? router.push("/") : goTo(phase.step - 1))}
            onRandom={() => {
              setChoice(STEPS[phase.step].category, RANDOM);
              goTo(phase.step + 1);
            }}
            onSkip={() => {
              setChoice(STEPS[phase.step].category, null);
              goTo(phase.step + 1);
            }}
          />
        ) : phase.kind === "explore" ? (
          <RecapView
            selection={selection}
            onEdit={goTo}
            onStyle={(style) => setChoice("style", style)}
            onCreate={createFromSelection}
            onBack={() => goTo(RECAP_STEP - 1)}
          />
        ) : phase.kind === "generating" ? (
          <GeneratingView onCancel={cancel} />
        ) : phase.kind === "error" ? (
          <section role="alert" className="animate-rise flex min-h-[55vh] flex-col items-center justify-center text-center">
            <p className="font-serif text-3xl">L&apos;image n&apos;a pas pu naître cette fois.</p>
            <p className="mt-4 max-w-md text-muted">{phase.message}</p>
            <p className="mt-2 text-sm text-faint">Tes choix sont gardés.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Button variant="secondary" onClick={() => setPhase(phase.from)}>
                Retour
              </Button>
              <Button onClick={phase.retry}>Réessayer</Button>
            </div>
          </section>
        ) : current ? (
          <ResultView
            key={current.id}
            creation={current}
            hasPrevious={creations.length > 1}
            onVariation={(adjustments) =>
              void generate(current.choices, current.randomPicks, adjustments, { kind: "result" })
            }
            onSurprise={surprise}
            onEdit={() => goTo(RECAP_STEP)}
            onRestart={restart}
            onPrevious={() => setCreations(([a, b, ...rest]) => [b, a, ...rest])}
          />
        ) : null}
      </main>
    </>
  );
}

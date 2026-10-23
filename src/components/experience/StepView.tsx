"use client";

import { useEffect, useRef } from "react";
import { CATEGORIES } from "@/lib/options";
import { CUSTOM, MAX_TEXT_LENGTH, RANDOM, type Choice } from "@/lib/selection";
import { Button } from "../Button";
import { ChoiceGrid } from "../ChoiceGrid";
import { ProgressDots } from "./ProgressDots";
import { STEPS } from "./steps";

export function StepView({
  stepIndex,
  value,
  text,
  onChoose,
  onText,
  onNext,
  onBack,
  onRandom,
  onSkip,
}: {
  stepIndex: number;
  value: Choice;
  text: string;
  onChoose: (id: string) => void;
  onText: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
  onRandom: () => void;
  onSkip: () => void;
}) {
  const step = STEPS[stepIndex];
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Déplace le focus sur le titre à chaque étape (lecteurs d'écran, clavier).
  useEffect(() => {
    headingRef.current?.focus();
  }, [stepIndex]);

  const concrete = value && value !== RANDOM ? value : null;
  const isCustom = value === CUSTOM;
  const canContinue = isCustom ? text.trim().length > 0 : Boolean(concrete);

  return (
    <section key={stepIndex} aria-labelledby="step-title" className="animate-rise">
      <ProgressDots current={stepIndex} />
      <h1
        id="step-title"
        ref={headingRef}
        tabIndex={-1}
        className="mt-8 font-serif text-3xl leading-tight text-paper focus:outline-none sm:text-4xl"
      >
        {step.title}
      </h1>
      <p className="mt-3 text-muted">{step.hint}</p>

      <div className="mt-8">
        <ChoiceGrid
          category={step.category}
          legend={step.title}
          options={CATEGORIES[step.category]}
          value={concrete}
          onChange={onChoose}
          layout={step.layout}
          customLabel={
            step.category === "feeling" ? "Autre chose, avec mes mots…" : "Autre…"
          }
        />

        {isCustom && (
          <div className="animate-rise mt-5 rounded-2xl border border-line bg-white/[0.03] p-4 sm:p-5">
            <label htmlFor="own-words" className="font-serif text-lg text-paper/90">
              Avec tes mots
            </label>
            <p id="own-words-hint" className="mt-1 text-sm text-muted">
              Dans la langue de ton choix. Quelques mots suffisent, rien à expliquer.
            </p>
            <textarea
              id="own-words"
              dir="auto"
              autoFocus
              rows={3}
              maxLength={MAX_TEXT_LENGTH}
              value={text}
              onChange={(e) => onText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && canContinue) {
                  e.preventDefault();
                  onNext();
                }
              }}
              placeholder={step.placeholder}
              aria-describedby="own-words-hint own-words-privacy"
              className="mt-3 w-full resize-none rounded-xl border border-line bg-black/25 px-4 py-3 font-serif text-[1.05rem] leading-relaxed text-paper placeholder:font-sans placeholder:text-sm placeholder:text-faint focus:border-paper/40 focus:outline-none"
            />
            <div className="mt-2 flex items-start justify-between gap-4 text-xs text-faint">
              <p id="own-words-privacy">
                Ces mots servent seulement à créer l&apos;image, puis sont oubliés.
                Évite les noms et informations personnelles.
              </p>
              <span aria-hidden className="shrink-0 tabular-nums">
                {text.length}/{MAX_TEXT_LENGTH}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={onBack} className="self-start">
          ← Retour
        </Button>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <Button variant="ghost" onClick={onSkip}>
            {step.category === "feeling" ? "Je ne sais pas" : "Passer"}
          </Button>
          <Button variant="secondary" onClick={onRandom}>
            <DiceIcon /> Laisser le hasard choisir
          </Button>
          <Button onClick={onNext} disabled={!canContinue}>
            Continuer
          </Button>
        </div>
      </div>
    </section>
  );
}

function DiceIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
      <circle cx="15" cy="15" r="1" fill="currentColor" />
      <circle cx="15" cy="9" r="1" fill="currentColor" />
      <circle cx="9" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

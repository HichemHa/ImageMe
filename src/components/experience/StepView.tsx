"use client";

import { useEffect, useRef } from "react";
import { CATEGORIES } from "@/lib/options";
import { RANDOM, type Choice } from "@/lib/selection";
import { Button } from "../Button";
import { ChoiceGrid } from "../ChoiceGrid";
import { ProgressDots } from "./ProgressDots";
import { STEPS } from "./steps";

export function StepView({
  stepIndex,
  value,
  onChoose,
  onNext,
  onBack,
  onRandom,
  onSkip,
}: {
  stepIndex: number;
  value: Choice;
  onChoose: (id: string) => void;
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
        />
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
          <Button onClick={onNext} disabled={!concrete}>
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

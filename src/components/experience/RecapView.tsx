"use client";

import { useEffect, useRef } from "react";
import { findOption, STYLES } from "@/lib/options";
import { CUSTOM, RANDOM, type Selection } from "@/lib/selection";
import { Button } from "../Button";
import { OptionVisual } from "../OptionVisual";
import { ProgressDots } from "./ProgressDots";
import { RECAP_STEP, STEPS } from "./steps";

export function RecapView({
  selection,
  onEdit,
  onStyle,
  onCreate,
  onBack,
}: {
  selection: Selection;
  onEdit: (stepIndex: number) => void;
  onStyle: (style: string) => void;
  onCreate: () => void;
  onBack: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  const nothingChosen = STEPS.every(
    (s) =>
      selection[s.category] === null ||
      (selection[s.category] === CUSTOM && !selection.texts[s.category]?.trim()),
  );

  return (
    <section aria-labelledby="recap-title" className="animate-rise">
      <ProgressDots current={RECAP_STEP} />
      <h1
        id="recap-title"
        ref={headingRef}
        tabIndex={-1}
        className="mt-8 font-serif text-3xl leading-tight focus:outline-none sm:text-4xl"
      >
        Voici ce que tu as rassemblé.
      </h1>
      <p className="mt-3 text-muted">
        {nothingChosen
          ? "Tu n'as rien choisi, et c'est très bien aussi. L'image partira d'un espace ouvert."
          : "Tu peux encore changer ce que tu veux, ou laisser tel quel."}
      </p>

      <ul className="mt-8 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white/[0.02]">
        {STEPS.map((step, i) => {
          const value = selection[step.category];
          const option = value && value !== RANDOM ? findOption(step.category, value) : undefined;
          const ownWords = value === CUSTOM ? selection.texts[step.category]?.trim() : undefined;
          const label = ownWords
            ? `« \u2068${ownWords}\u2069 »`
            : value === RANDOM
              ? "Le hasard choisira"
              : option
                ? option.label
                : "Laissé ouvert";
          return (
            <li key={step.category} className="flex items-center gap-4 px-4 py-3 sm:px-5">
              <span className="h-9 w-9 shrink-0 text-paper/80">
                {option && step.category !== "feeling" ? (
                  <OptionVisual category={step.category} id={option.id} />
                ) : (
                  <span
                    aria-hidden
                    className={`flex h-full w-full items-center justify-center rounded-full border border-dashed ${value ? "border-paper/40" : "border-paper/15"} text-xs text-faint`}
                  >
                    {value === RANDOM ? "?" : ownWords ? "✎" : ""}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs uppercase tracking-[0.18em] text-faint">
                  {step.short}
                </span>
                <span
                  className={`block line-clamp-2 ${option || ownWords ? "text-paper" : "text-muted italic"} ${ownWords ? "font-serif" : ""}`}
                >
                  {label}
                </span>
              </span>
              <Button
                variant="ghost"
                onClick={() => onEdit(i)}
                aria-label={`Changer : ${step.short}`}
              >
                Changer
              </Button>
            </li>
          );
        })}
      </ul>

      <fieldset className="mt-8">
        <legend className="text-xs uppercase tracking-[0.18em] text-faint">
          Style <span className="normal-case tracking-normal">(facultatif)</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {[{ id: RANDOM, label: "Surprends-moi" }, ...STYLES].map((s) => {
            const checked = selection.style === s.id;
            return (
              <label
                key={s.id}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-glow ${
                  checked
                    ? "border-paper/60 bg-white/10 text-paper"
                    : "border-line text-muted hover:border-paper/30 hover:text-paper"
                }`}
              >
                <input
                  type="radio"
                  name="style"
                  value={s.id}
                  checked={checked}
                  onChange={() => onStyle(s.id)}
                  className="sr-only"
                />
                {s.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-10 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={onBack} className="self-start">
          ← Retour
        </Button>
        <Button onClick={onCreate} className="px-8 py-3.5 text-base">
          Donner une forme
        </Button>
      </div>
    </section>
  );
}

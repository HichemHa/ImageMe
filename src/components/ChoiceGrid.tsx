"use client";

import type { CategoryId, Option } from "@/lib/options";
import { OptionVisual } from "./OptionVisual";

/**
 * Groupe de choix accessible (vrais boutons radio, navigation au clavier
 * avec les flèches) présenté sous forme de cartes visuelles.
 */
export function ChoiceGrid({
  category,
  legend,
  options,
  value,
  onChange,
  layout = "grid",
  customLabel,
}: {
  category: CategoryId;
  legend: string;
  options: Option[];
  value: string | null;
  onChange: (id: string) => void;
  layout?: "grid" | "list";
  /** Ajoute une option « Autre… » (valeur "custom"), pour s'exprimer avec ses mots. */
  customLabel?: string;
}) {
  const name = `choice-${category}`;
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div
        className={
          layout === "list"
            ? "grid gap-2.5 sm:grid-cols-2"
            : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        }
      >
        {[...options, ...(customLabel ? [{ id: "custom", label: customLabel, prompt: "" }] : [])].map((option, i) => {
          const checked = value === option.id;
          return (
            <label
              key={option.id}
              style={{ animationDelay: `${i * 45}ms` }}
              className={[
                "animate-rise group relative flex cursor-pointer rounded-2xl border transition duration-300",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-glow",
                checked
                  ? "border-paper/60 bg-white/[0.09] shadow-[0_0_50px_-18px_var(--glow)]"
                  : "border-line bg-white/[0.025] hover:border-paper/25 hover:bg-white/[0.05]",
                layout === "list"
                  ? "items-center gap-4 px-5 py-4 text-left"
                  : "flex-col items-center gap-3 px-3 pb-4 pt-5 text-center",
              ].join(" ")}
            >
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={checked}
                onChange={() => onChange(option.id)}
                className="peer sr-only"
              />
              {layout === "grid" && (
                <span
                  className={`block h-14 w-14 text-paper/85 transition duration-500 sm:h-16 sm:w-16 ${checked ? "scale-110" : "group-hover:scale-105"}`}
                >
                  {option.id === "custom" ? (
                    <PenGlyph />
                  ) : (
                    <OptionVisual category={category} id={option.id} />
                  )}
                </span>
              )}
              {layout === "list" && (
                <span
                  aria-hidden
                  className={`h-2 w-2 shrink-0 rounded-full transition duration-500 ${checked ? "bg-paper shadow-[0_0_12px_2px_var(--glow)]" : "bg-paper/25"}`}
                />
              )}
              <span
                className={
                  layout === "list"
                    ? "font-serif text-[1.05rem] leading-snug text-paper/90"
                    : "text-sm text-paper/85"
                }
              >
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function PenGlyph() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-full w-full"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 46 C22 38 26 50 34 42 S46 40 50 46" strokeOpacity="0.5" />
      <path d="M40 14 L48 22 L28 42 L19 45 L22 36 Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M36 18 L44 26" strokeOpacity="0.6" />
    </svg>
  );
}

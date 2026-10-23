import { STEPS } from "./steps";

/** Progression discrète : des points, pas un formulaire numéroté. */
export function ProgressDots({ current }: { current: number }) {
  const total = STEPS.length + 1;
  return (
    <div className="flex items-center gap-2" aria-label={`Étape ${Math.min(current + 1, total)} sur ${total}`} role="img">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-700 ${
            i === current ? "w-8 bg-paper" : i < current ? "w-1.5 bg-paper/60" : "w-1.5 bg-paper/20"
          }`}
        />
      ))}
    </div>
  );
}

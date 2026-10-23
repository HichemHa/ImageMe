"use client";

import dynamic from "next/dynamic";

/**
 * Le parcours lit l'état de l'onglet (sessionStorage) dès son premier rendu :
 * il est donc rendu uniquement dans le navigateur.
 */
export const ExperienceLoader = dynamic(
  () => import("./Experience").then((m) => m.Experience),
  { ssr: false },
);

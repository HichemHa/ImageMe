"use client";

/* eslint-disable @next/next/no-img-element -- images locales en data URL */

import { useEffect, useState } from "react";
import {
  clearCollection,
  deleteCreation,
  isCollectionEnabled,
  listCreations,
  setCollectionEnabled,
  type SavedCreation,
} from "@/lib/collection";
import { Button, ButtonLink } from "./Button";
import { ImageActions } from "./ImageActions";

type State =
  | { kind: "loading" }
  | { kind: "ready"; items: SavedCreation[]; enabled: boolean }
  | { kind: "unavailable" };

export function CollectionView() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [open, setOpen] = useState<SavedCreation | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const load = async () => {
    try {
      const items = await listCreations();
      setState({ kind: "ready", items, enabled: isCollectionEnabled() });
    } catch {
      setState({ kind: "unavailable" });
    }
  };

  useEffect(() => {
    listCreations()
      .then((items) => setState({ kind: "ready", items, enabled: isCollectionEnabled() }))
      .catch(() => setState({ kind: "unavailable" }));
  }, []);

  if (state.kind === "loading") {
    return <p className="mt-10 text-faint">Ouverture…</p>;
  }
  if (state.kind === "unavailable") {
    return (
      <p className="mt-10 text-muted">
        Ce navigateur ne permet pas de garder des images (navigation privée ?).
        Tu peux toujours télécharger tes créations.
      </p>
    );
  }

  const { items, enabled } = state;

  const remove = async (id: string) => {
    await deleteCreation(id);
    setOpen(null);
    await load();
  };

  const clearAll = async (disable: boolean) => {
    await clearCollection();
    if (disable) setCollectionEnabled(false);
    setConfirmClear(false);
    await load();
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/[0.02] px-5 py-4 text-sm">
        <span className="flex-1 text-muted">
          {enabled
            ? "Ta collection est activée sur cet appareil."
            : "Ta collection est désactivée. Elle s'active quand tu choisis de garder une image."}
        </span>
        {enabled && (
          <Button variant="ghost" onClick={() => setConfirmClear(true)}>
            {items.length ? "Tout effacer / désactiver" : "Désactiver"}
          </Button>
        )}
      </div>

      {confirmClear && (
        <div role="alertdialog" aria-labelledby="clear-title" className="animate-rise mt-4 rounded-2xl border border-line bg-ink-raised/80 p-5 text-sm">
          <p id="clear-title" className="text-paper">
            Effacer toutes les images gardées sur cet appareil ?
          </p>
          <p className="mt-1 text-muted">Cette action est définitive.</p>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Annuler
            </Button>
            <Button variant="secondary" onClick={() => clearAll(false)} disabled={!items.length}>
              Effacer les images
            </Button>
            <Button onClick={() => clearAll(true)}>Effacer et désactiver</Button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-serif text-xl italic text-paper/80">
            Rien ici pour l&apos;instant.
          </p>
          <ButtonLink href="/creer" className="mt-6">
            Créer une image
          </ButtonLink>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setOpen(item)}
                className="group block w-full overflow-hidden rounded-2xl border border-line"
                aria-label={`Ouvrir l'image du ${new Date(item.createdAt).toLocaleDateString("fr-FR")}`}
              >
                <img
                  src={item.image}
                  alt=""
                  className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image de ta collection"
          className="fixed inset-0 z-50 overflow-y-auto bg-ink/90 px-5 py-8 backdrop-blur-md"
          onKeyDown={(e) => e.key === "Escape" && setOpen(null)}
        >
          <div className="mx-auto max-w-xl">
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setOpen(null)} autoFocus>
                Fermer
              </Button>
            </div>
            <img
              src={open.image}
              alt="Image de ta collection"
              className="mt-2 aspect-square w-full rounded-3xl object-cover"
            />
            <p className="mt-3 text-center text-xs text-faint">
              {new Date(open.createdAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
              {open.demo && " · mode démonstration"}
            </p>
            <div className="mt-6">
              <ImageActions item={open} showSave={false} />
            </div>
            <div className="mt-2 flex justify-center">
              <Button variant="ghost" onClick={() => remove(open.id)}>
                Supprimer de ma collection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  isCollectionEnabled,
  saveCreation,
  setCollectionEnabled,
  type SavedCreation,
} from "@/lib/collection";
import { downloadImage, shareImage } from "@/lib/image-utils";
import { Button } from "./Button";

type Panel = null | "share" | "share-fallback" | "confirm-collection";

/**
 * Actions sur une image : télécharger, partager, garder dans la collection.
 * Le partage et la conservation sont toujours volontaires.
 */
export function ImageActions({
  item,
  showSave = true,
}: {
  item: SavedCreation;
  showSave?: boolean;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const onDownload = async () => {
    setBusy(true);
    try {
      await downloadImage(item);
      setStatus("Image téléchargée.");
    } catch {
      setStatus("Le téléchargement n'a pas fonctionné. Tu peux réessayer.");
    } finally {
      setBusy(false);
    }
  };

  const onShare = async () => {
    setBusy(true);
    try {
      const result = await shareImage(item, note);
      if (result === "shared") {
        setStatus("Image partagée.");
        setPanel(null);
      } else if (result === "unsupported") {
        setPanel("share-fallback");
      }
    } finally {
      setBusy(false);
    }
  };

  const doSave = async () => {
    try {
      await saveCreation(item);
      setSaved(true);
      setPanel(null);
      setStatus("Gardée dans ta collection, sur cet appareil.");
    } catch {
      setStatus("Impossible d'enregistrer sur cet appareil (navigation privée ?).");
    }
  };

  const onSave = () => {
    if (isCollectionEnabled()) void doSave();
    else setPanel("confirm-collection");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button variant="secondary" onClick={onDownload} disabled={busy}>
          <DownloadIcon /> Télécharger
        </Button>
        <Button
          variant="secondary"
          onClick={() => setPanel(panel === "share" ? null : "share")}
          aria-expanded={panel === "share"}
          disabled={busy}
        >
          <ShareIcon /> Partager
        </Button>
        {showSave && (
          <Button variant="secondary" onClick={onSave} disabled={saved || busy}>
            <KeepIcon /> {saved ? "Gardée" : "Garder"}
          </Button>
        )}
      </div>

      {panel === "share" && (
        <div className="animate-rise mx-auto max-w-md rounded-2xl border border-line bg-ink-raised/80 p-5 text-left backdrop-blur">
          <p className="text-sm text-muted">
            Tu choisis à qui l&apos;envoyer. L&apos;image part directement de ton
            appareil, sans passer par nous.
          </p>
          <label className="mt-4 block text-sm text-paper/80" htmlFor="share-note">
            Un mot pour l&apos;accompagner <span className="text-faint">(facultatif)</span>
          </label>
          <textarea
            id="share-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={280}
            rows={2}
            placeholder="Je voulais te montrer ça."
            className="mt-2 w-full resize-none rounded-xl border border-line bg-black/20 px-3 py-2 text-sm text-paper placeholder:text-faint focus:border-paper/40 focus:outline-none"
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPanel(null)}>
              Annuler
            </Button>
            <Button onClick={onShare} disabled={busy}>
              Choisir à qui l&apos;envoyer
            </Button>
          </div>
        </div>
      )}

      {panel === "share-fallback" && (
        <div className="animate-rise mx-auto max-w-md rounded-2xl border border-line bg-ink-raised/80 p-5 text-left text-sm backdrop-blur">
          <p className="text-paper/85">
            Ce navigateur ne permet pas d&apos;envoyer l&apos;image directement.
          </p>
          <p className="mt-2 text-muted">
            Télécharge-la, puis envoie-la à la personne de ton choix par le moyen
            que tu préfères.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPanel(null)}>
              Fermer
            </Button>
            <Button onClick={onDownload}>Télécharger</Button>
          </div>
        </div>
      )}

      {panel === "confirm-collection" && (
        <div className="animate-rise mx-auto max-w-md rounded-2xl border border-line bg-ink-raised/80 p-5 text-left text-sm backdrop-blur">
          <p className="text-paper/85">Activer ta collection privée ?</p>
          <p className="mt-2 text-muted">
            Tes images seront gardées uniquement dans ce navigateur, sur cet
            appareil. Rien n&apos;est envoyé ailleurs, et tu peux tout effacer à
            tout moment.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPanel(null)}>
              Non merci
            </Button>
            <Button
              onClick={() => {
                setCollectionEnabled(true);
                void doSave();
              }}
            >
              Activer et garder
            </Button>
          </div>
        </div>
      )}

      <p role="status" aria-live="polite" className="min-h-5 text-center text-xs text-muted">
        {status}
      </p>
    </div>
  );
}

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function DownloadIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 15V4m0 0L8 8m4-4 4 4M6 12v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

function KeepIcon() {
  return (
    <svg {...iconProps}>
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

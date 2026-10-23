"use client";

import { SITE_NAME } from "./site";

export interface ImageLike {
  image: string; // data URL
  mimeType: string;
  createdAt: number;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? "application/octet-stream";
  const bytes = atob(data);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

/** Rastérise une image SVG en PNG (pour un fichier lisible partout). */
async function svgToPng(dataUrl: string, size = 1024): Promise<Blob> {
  const img = new Image();
  img.decoding = "async";
  img.src = dataUrl;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  ctx.drawImage(img, 0, 0, size, size);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Conversion impossible"))), "image/png"),
  );
}

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

function fileName(createdAt: number, ext: string) {
  const d = new Date(createdAt);
  const pad = (n: number) => String(n).padStart(2, "0");
  const slug = SITE_NAME.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-");
  return `${slug}-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.${ext}`;
}

/** Fichier prêt à télécharger ou partager (SVG converti en PNG). */
export async function toFile(item: ImageLike): Promise<File> {
  const blob =
    item.mimeType === "image/svg+xml"
      ? await svgToPng(item.image)
      : dataUrlToBlob(item.image);
  const ext = EXT[blob.type] ?? "png";
  return new File([blob], fileName(item.createdAt, ext), { type: blob.type });
}

export async function downloadImage(item: ImageLike): Promise<void> {
  const file = await toFile(item);
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export type ShareResult = "shared" | "cancelled" | "unsupported";

/**
 * Partage volontaire via la feuille de partage du système (Web Share API).
 * L'image va directement de l'appareil à l'application choisie :
 * elle ne transite par aucun serveur.
 */
export async function shareImage(item: ImageLike, text?: string): Promise<ShareResult> {
  if (typeof navigator === "undefined" || !navigator.share) return "unsupported";
  const file = await toFile(item);
  const data: ShareData = { files: [file] };
  if (text?.trim()) data.text = text.trim();
  if (navigator.canShare && !navigator.canShare(data)) return "unsupported";
  try {
    await navigator.share(data);
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    return "unsupported";
  }
}

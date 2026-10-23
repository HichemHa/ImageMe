"use client";

/**
 * Collection privée, stockée uniquement dans ce navigateur (IndexedDB).
 * Désactivée par défaut : rien n'est conservé sans action explicite.
 */

export interface SavedCreation {
  id: string;
  image: string;
  mimeType: string;
  summary: string[];
  demo: boolean;
  createdAt: number;
}

const DB_NAME = "sans-mots";
const STORE = "creations";
const ENABLED_KEY = "sans-mots:collection-enabled";

export function isCollectionEnabled(): boolean {
  try {
    return localStorage.getItem(ENABLED_KEY) === "1";
  } catch {
    return false;
  }
}

export function setCollectionEnabled(enabled: boolean) {
  try {
    if (enabled) localStorage.setItem(ENABLED_KEY, "1");
    else localStorage.removeItem(ENABLED_KEY);
  } catch {
    // stockage indisponible (navigation privée…)
  }
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB indisponible"));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req.result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function saveCreation(item: SavedCreation): Promise<void> {
  await run("readwrite", (s) => s.put(item));
}

export async function listCreations(): Promise<SavedCreation[]> {
  const all = await run<SavedCreation[]>("readonly", (s) => s.getAll());
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteCreation(id: string): Promise<void> {
  await run("readwrite", (s) => s.delete(id));
}

export async function clearCollection(): Promise<void> {
  await run("readwrite", (s) => s.clear());
}

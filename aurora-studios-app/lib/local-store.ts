import { useSyncExternalStore } from "react";

/**
 * Pequeño estado guardado en el navegador (localStorage) y compartido entre
 * componentes. En el servidor y durante la hidratación devuelve `fallback`,
 * así el HTML prerenderizado nunca choca con lo guardado.
 */
export function createLocalStore<T>(key: string, fallback: T, parse: (raw: unknown) => T) {
  let cache: T | undefined;
  const listeners = new Set<() => void>();

  const read = (): T => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? parse(JSON.parse(raw)) : fallback;
    } catch {
      return fallback;
    }
  };

  const get = () => {
    if (cache === undefined) cache = read();
    return cache;
  };

  const set = (next: T | ((prev: T) => T)) => {
    cache = typeof next === "function" ? (next as (prev: T) => T)(get()) : next;
    try {
      window.localStorage.setItem(key, JSON.stringify(cache));
    } catch {
      // Navegación privada o almacenamiento bloqueado: el estado sigue en memoria.
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = undefined;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  const useValue = () => useSyncExternalStore(subscribe, get, () => fallback);

  return { get, set, useValue };
}

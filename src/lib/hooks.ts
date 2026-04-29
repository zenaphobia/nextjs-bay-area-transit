import { useCallback, useEffect, useRef, useState } from "react";

type SetValue<T> = T | ((prev: T) => T);

// Module-level flag so we only request persistence once per page load,
// even if multiple useLocalStorage hooks are mounted.
let persistenceRequested = false;

// Cross-instance sync within the same tab — storage events only fire in other tabs.
const subscribers = new Map<string, Set<(value: unknown) => void>>();

function notifySubscribers(key: string, value: unknown) {
  subscribers.get(key)?.forEach((cb) => cb(value));
}

async function requestPersistence() {
  if (persistenceRequested) return;
  persistenceRequested = true;

  if (typeof navigator === "undefined" || !navigator.storage?.persist) return;

  try {
    const alreadyPersisted = await navigator.storage.persisted?.();
    if (alreadyPersisted) return;

    const granted = await navigator.storage.persist();
    if (!granted) {
      // Allow a future call to retry — Safari may grant it later
      // once engagement signals build up.
      persistenceRequested = false;
    }
  } catch {
    persistenceRequested = false;
  }
}

export function useLocalStorage<T>({
  key,
  defaultValue,
}: {
  key: string;
  defaultValue: T;
}) {
  const [value, setValueState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      console.error(`[useLocalStorage] Failed to parse ${key}`);
      return defaultValue;
    }
  });

  const valueRef = useRef(value);
  valueRef.current = value;

  const setValue = useCallback(
    (next: SetValue<T>) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(valueRef.current)
          : next;

      setValueState(resolved);

      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
        notifySubscribers(key, resolved);
        void requestPersistence();
      } catch (e) {
        console.warn(`[useLocalStorage] Failed to write ${key}:`, e);
      }
    },
    [key],
  );

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key !== key || e.storageArea !== window.localStorage) return;
      if (e.newValue === null) {
        setValueState(defaultValue);
        return;
      }
      try {
        setValueState(JSON.parse(e.newValue) as T);
      } catch {
        // ignore malformed external write
      }
    }

    function handleSameTab(value: unknown) {
      setValueState(value as T);
    }

    if (!subscribers.has(key)) subscribers.set(key, new Set());
    subscribers.get(key)!.add(handleSameTab);

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      subscribers.get(key)?.delete(handleSameTab);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { value, setValue };
}

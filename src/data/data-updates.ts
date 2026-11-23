import { useSyncExternalStore } from 'react';

let revision = 0;
const listeners = new Set<() => void>();

export function notifyDataUpdated(): void {
  revision += 1;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDataUpdates(): number {
  return useSyncExternalStore(subscribe, () => revision);
}

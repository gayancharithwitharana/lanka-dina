import { useSyncExternalStore } from 'react';
import mobileAds, { AdsConsent } from 'react-native-google-mobile-ads';

let adsReady = false;
let preparing: Promise<void> | null = null;
const listeners = new Set<() => void>();

export function prepareAds(): Promise<void> {
  preparing ??= gatherConsentAndInitialize();
  return preparing;
}

async function gatherConsentAndInitialize(): Promise<void> {
  const canRequestAds = await AdsConsent.gatherConsent().then(
    (consent) => consent.canRequestAds,
    // Google's guidance: after a consent error, still request ads with the previous session's consent.
    () => AdsConsent.getConsentInfo().then((consent) => consent.canRequestAds),
  );
  if (!canRequestAds) return;

  await mobileAds().initialize();
  adsReady = true;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAdsReady(): boolean {
  return useSyncExternalStore(subscribe, () => adsReady);
}

export function resetAdsForTests(): void {
  adsReady = false;
  preparing = null;
}

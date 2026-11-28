import { useSyncExternalStore } from 'react';
import mobileAds, {
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  type AdsConsentInfo,
} from 'react-native-google-mobile-ads';

let adsReady = false;
let privacyOptionsRequired = false;
let sdkStarted = false;
let preparing: Promise<void> | null = null;
const listeners = new Set<() => void>();

export function prepareAds(): Promise<void> {
  preparing ??= gatherConsent().then(applyConsent);
  return preparing;
}

export async function showPrivacyOptions(): Promise<void> {
  await AdsConsent.showPrivacyOptionsForm();
  await applyConsent(await AdsConsent.getConsentInfo());
}

function gatherConsent(): Promise<AdsConsentInfo> {
  // Google's guidance: after a consent error, still request ads with the previous session's consent.
  return AdsConsent.gatherConsent().catch(() => AdsConsent.getConsentInfo());
}

async function applyConsent(consent: AdsConsentInfo): Promise<void> {
  privacyOptionsRequired =
    consent.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
  if (consent.canRequestAds && !sdkStarted) {
    await mobileAds().initialize();
    sdkStarted = true;
  }
  adsReady = consent.canRequestAds;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAdsReady(): boolean {
  return useSyncExternalStore(subscribe, () => adsReady);
}

export function usePrivacyOptionsRequired(): boolean {
  return useSyncExternalStore(subscribe, () => privacyOptionsRequired);
}

export function resetAdsForTests(): void {
  adsReady = false;
  privacyOptionsRequired = false;
  sdkStarted = false;
  preparing = null;
}

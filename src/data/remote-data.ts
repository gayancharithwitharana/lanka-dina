import Storage from 'expo-sqlite/kv-store';

import { parseDataFile, parseManifest } from '@/data/data-file-schema';
import { applyDataFile, getStoredVersion } from '@/db/apply-data-file';

export const DATA_URL = 'https://gayancharithwitharana.github.io/lanka-dina/';
export const PRIVACY_POLICY_URL = `${DATA_URL}privacy.html`;

const LAST_CHECK_KEY = 'remote-data-last-check';
const CHECK_INTERVAL_MS = 60 * 60 * 1000;

let updateInProgress: Promise<boolean> | null = null;

export function updateRemoteData(now = new Date()): Promise<boolean> {
  updateInProgress ??= checkForUpdates(now).finally(() => {
    updateInProgress = null;
  });
  return updateInProgress;
}

async function checkForUpdates(now: Date): Promise<boolean> {
  if (!isCheckDue(now)) return false;

  const manifest = parseManifest(await fetchJson('manifest.json'));
  Storage.setItemSync(LAST_CHECK_KEY, now.toISOString());

  let changed = false;
  for (const entry of manifest.files) {
    if (getStoredVersion(entry.dataset, entry.year) >= entry.version) continue;
    try {
      changed = applyDataFile(parseDataFile(await fetchJson(entry.path))) || changed;
    } catch (error) {
      console.warn(`Skipped data file ${entry.path}`, error);
    }
  }
  return changed;
}

function isCheckDue(now: Date): boolean {
  const lastCheck = Storage.getItemSync(LAST_CHECK_KEY);
  return !lastCheck || now.getTime() - new Date(lastCheck).getTime() >= CHECK_INTERVAL_MS;
}

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(new URL(path, DATA_URL).toString());
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

import Storage from 'expo-sqlite/kv-store';

import type { WeekStart } from '@/utils/calendar';

export type Language = 'en' | 'si' | 'ta';

export type Settings = {
  language: Language;
  weekStartsOn: WeekStart;
};

const SETTINGS_KEY = 'settings';

const defaultSettings: Settings = {
  language: 'en',
  weekStartsOn: 0,
};

export function loadSettings(): Settings {
  const savedSettings = Storage.getItemSync(SETTINGS_KEY);
  return savedSettings ? { ...defaultSettings, ...JSON.parse(savedSettings) } : defaultSettings;
}

export function saveSettings(settings: Settings): void {
  Storage.setItemSync(SETTINGS_KEY, JSON.stringify(settings));
}

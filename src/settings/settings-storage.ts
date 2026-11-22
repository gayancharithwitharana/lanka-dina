import { getLocales } from 'expo-localization';
import Storage from 'expo-sqlite/kv-store';

import { lagnas, type Lagna } from '@/constants/lagnas';
import type { WeekStart } from '@/utils/calendar';

export type Language = 'en' | 'si' | 'ta';

export type Appearance = 'system' | 'light' | 'dark';

export type Settings = {
  language: Language;
  weekStartsOn: WeekStart;
  appearance: Appearance;
  lagna: Lagna | null;
  poyaReminders: boolean;
  longWeekendReminders: boolean;
};

const SETTINGS_KEY = 'settings';

const defaultSettings: Settings = {
  language: 'en',
  weekStartsOn: 0,
  appearance: 'system',
  lagna: null,
  poyaReminders: true,
  longWeekendReminders: false,
};

const languages: Language[] = ['en', 'si', 'ta'];
const weekStarts: WeekStart[] = [0, 1];
const appearances: Appearance[] = ['system', 'light', 'dark'];
const booleans = [true, false];

export function loadSettings(): Settings {
  const savedSettings = readSavedSettings();
  return {
    language: pickAllowed(savedSettings.language, languages, getDeviceLanguage()),
    weekStartsOn: pickAllowed(savedSettings.weekStartsOn, weekStarts, defaultSettings.weekStartsOn),
    appearance: pickAllowed(savedSettings.appearance, appearances, defaultSettings.appearance),
    lagna: pickAllowed<Lagna | null>(savedSettings.lagna, [...lagnas], defaultSettings.lagna),
    poyaReminders: pickAllowed(
      savedSettings.poyaReminders,
      booleans,
      defaultSettings.poyaReminders,
    ),
    longWeekendReminders: pickAllowed(
      savedSettings.longWeekendReminders,
      booleans,
      defaultSettings.longWeekendReminders,
    ),
  };
}

function getDeviceLanguage(): Language {
  const preferredLanguage = getLocales()
    .map((locale) => locale.languageCode)
    .find((code) => languages.includes(code as Language));
  return (preferredLanguage as Language | undefined) ?? defaultSettings.language;
}

function readSavedSettings(): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(Storage.getItemSync(SETTINGS_KEY) ?? '{}');
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function pickAllowed<Value>(value: unknown, allowedValues: Value[], fallback: Value): Value {
  return allowedValues.includes(value as Value) ? (value as Value) : fallback;
}

export function saveSettings(settings: Settings): void {
  Storage.setItemSync(SETTINGS_KEY, JSON.stringify(settings));
}

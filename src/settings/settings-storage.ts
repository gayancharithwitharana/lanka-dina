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
};

const SETTINGS_KEY = 'settings';

const defaultSettings: Settings = {
  language: 'en',
  weekStartsOn: 0,
  appearance: 'system',
  lagna: null,
};

const languages: Language[] = ['en', 'si', 'ta'];
const weekStarts: WeekStart[] = [0, 1];
const appearances: Appearance[] = ['system', 'light', 'dark'];

export function loadSettings(): Settings {
  const savedSettings = readSavedSettings();
  return {
    language: pickAllowed(savedSettings.language, languages, defaultSettings.language),
    weekStartsOn: pickAllowed(savedSettings.weekStartsOn, weekStarts, defaultSettings.weekStartsOn),
    appearance: pickAllowed(savedSettings.appearance, appearances, defaultSettings.appearance),
    lagna: pickAllowed<Lagna | null>(savedSettings.lagna, [...lagnas], defaultSettings.lagna),
  };
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

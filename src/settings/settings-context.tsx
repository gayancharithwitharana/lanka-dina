import { colorScheme } from 'nativewind';
import { createContext, useContext, useState, type ReactNode } from 'react';

import i18n from '@/i18n';
import { loadSettings, saveSettings, type Settings } from '@/settings/settings-storage';

type SettingsContextValue = Settings & {
  updateSettings: (changes: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(loadSettings);

  function updateSettings(changes: Partial<Settings>) {
    const updatedSettings = { ...settings, ...changes };
    setSettings(updatedSettings);
    saveSettings(updatedSettings);
    if (changes.language) {
      i18n.changeLanguage(changes.language);
    }
    if (changes.appearance) {
      colorScheme.set(changes.appearance);
    }
  }

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const settings = useContext(SettingsContext);
  if (!settings) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }
  return settings;
}

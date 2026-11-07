import Storage from 'expo-sqlite/kv-store';

import { loadSettings, saveSettings } from '@/settings/settings-storage';

beforeEach(() => {
  (Storage as unknown as { clear: () => void }).clear();
});

describe('settings storage', () => {
  it('returns defaults when nothing is saved', () => {
    expect(loadSettings()).toEqual({ language: 'en', weekStartsOn: 0, appearance: 'system' });
  });

  it('loads what was saved', () => {
    saveSettings({ language: 'si', weekStartsOn: 1, appearance: 'dark' });
    expect(loadSettings()).toEqual({ language: 'si', weekStartsOn: 1, appearance: 'dark' });
  });

  it('fills in settings added after the user last saved', () => {
    Storage.setItemSync('settings', JSON.stringify({ language: 'ta' }));
    expect(loadSettings()).toEqual({ language: 'ta', weekStartsOn: 0, appearance: 'system' });
  });
});

import { getLocales, type Locale } from 'expo-localization';
import Storage from 'expo-sqlite/kv-store';

import { loadSettings, saveSettings } from '@/settings/settings-storage';

function setDeviceLanguages(...languageCodes: string[]) {
  const locales = languageCodes.map((languageCode) => ({ languageCode }) as Locale);
  jest.mocked(getLocales).mockReturnValue(locales as [Locale, ...Locale[]]);
}

beforeEach(() => {
  (Storage as unknown as { clear: () => void }).clear();
  setDeviceLanguages('en');
});

describe('settings storage', () => {
  it.each([
    [['si'], 'si'],
    [['ta'], 'ta'],
    [['fr'], 'en'],
    [['fr', 'ta', 'si'], 'ta'],
    [['en', 'si'], 'en'],
  ])('starts with the phone language %j as %s', (deviceLanguages, language) => {
    setDeviceLanguages(...deviceLanguages);
    expect(loadSettings().language).toBe(language);
  });

  it('keeps the chosen language over the phone language', () => {
    saveSettings({ ...loadSettings(), language: 'en' });
    setDeviceLanguages('si');
    expect(loadSettings().language).toBe('en');
  });

  it('returns defaults when nothing is saved', () => {
    expect(loadSettings()).toEqual({
      language: 'en',
      weekStartsOn: 0,
      appearance: 'system',
      lagna: null,
      poyaReminders: true,
      longWeekendReminders: false,
    });
  });

  it('loads what was saved', () => {
    saveSettings({
      language: 'si',
      weekStartsOn: 1,
      appearance: 'dark',
      lagna: 'simha',
      poyaReminders: false,
      longWeekendReminders: true,
    });
    expect(loadSettings()).toEqual({
      language: 'si',
      weekStartsOn: 1,
      appearance: 'dark',
      lagna: 'simha',
      poyaReminders: false,
      longWeekendReminders: true,
    });
  });

  it('fills in settings added after the user last saved', () => {
    Storage.setItemSync('settings', JSON.stringify({ language: 'ta' }));
    expect(loadSettings()).toEqual({
      language: 'ta',
      weekStartsOn: 0,
      appearance: 'system',
      lagna: null,
      poyaReminders: true,
      longWeekendReminders: false,
    });
  });

  it('falls back to defaults when the saved value is not valid JSON', () => {
    Storage.setItemSync('settings', '{"language": "si"');
    expect(loadSettings()).toEqual({
      language: 'en',
      weekStartsOn: 0,
      appearance: 'system',
      lagna: null,
      poyaReminders: true,
      longWeekendReminders: false,
    });
  });

  it('ignores saved values that are not valid choices', () => {
    Storage.setItemSync(
      'settings',
      JSON.stringify({
        language: 'fr',
        weekStartsOn: 5,
        appearance: 'dark',
        lagna: 'pluto',
        poyaReminders: 'yes',
      }),
    );
    expect(loadSettings()).toEqual({
      language: 'en',
      weekStartsOn: 0,
      appearance: 'dark',
      lagna: null,
      poyaReminders: true,
      longWeekendReminders: false,
    });
  });

  it('falls back to defaults when the saved value is not an object', () => {
    Storage.setItemSync('settings', 'null');
    expect(loadSettings()).toEqual({
      language: 'en',
      weekStartsOn: 0,
      appearance: 'system',
      lagna: null,
      poyaReminders: true,
      longWeekendReminders: false,
    });
  });
});

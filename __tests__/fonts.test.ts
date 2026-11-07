import { fontFamilyDefinitions, getLanguageFont } from '@/fonts';

const tailwindFontFamilies: Record<string, string[]> =
  require('../tailwind.config.js').theme.extend.fontFamily;

describe('getLanguageFont', () => {
  it.each([
    ['en', 'Inter'],
    ['si', 'NotoSansSinhala'],
    ['ta', 'NotoSansTamil'],
  ])('uses the %s font family %s', (language, fontFamily) => {
    expect(getLanguageFont(language).fontFamily).toBe(fontFamily);
  });

  it('falls back to the English font for unknown languages', () => {
    expect(getLanguageFont('fr')).toEqual(getLanguageFont('en'));
  });

  it.each(['en', 'si', 'ta'])('gives %s a Tailwind class for the same family', (language) => {
    const { fontFamily, className } = getLanguageFont(language);
    expect(tailwindFontFamilies[className.replace('font-', '')]).toEqual([fontFamily]);
  });
});

describe('fontFamilyDefinitions', () => {
  it.each(['en', 'si', 'ta'])('loads every weight the UI uses for %s', (language) => {
    const { fontFamily } = getLanguageFont(language);
    const definition = fontFamilyDefinitions.find((family) => family.fontFamily === fontFamily);
    expect(definition?.fontDefinitions.map((face) => face.weight)).toEqual([400, 500, 600, 700]);
  });
});

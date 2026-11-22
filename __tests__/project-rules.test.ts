import fs from 'node:fs';
import path from 'node:path';

import { dark, light } from '@/constants/colors';
import en from '@/locales/en.json';
import si from '@/locales/si.json';
import ta from '@/locales/ta.json';

type Translations = { [key: string]: string | Translations };

function flattenKeys(translations: Translations, prefix = ''): Record<string, string> {
  return Object.entries(translations).reduce<Record<string, string>>((flat, [key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string'
      ? { ...flat, [fullKey]: value }
      : { ...flat, ...flattenKeys(value, fullKey) };
  }, {});
}

function listSourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(entryPath);
    return /\.tsx?$/.test(entry.name) ? [entryPath] : [];
  });
}

const sourceDirectory = path.join(__dirname, '..', 'src');
const componentFiles = listSourceFiles(sourceDirectory);
const englishKeys = flattenKeys(en);

const tamilKeysAwaitingSourcedTerms = [
  'nakath.maruDirection',
  'nakath.kalaHorawaNow',
  'nakath.yourYear',
  'nakath.noAyaWaya',
];

describe('translations', () => {
  it('has no empty English strings', () => {
    for (const [key, value] of Object.entries(englishKeys)) {
      expect({ key, value: value.trim() }).not.toEqual({ key, value: '' });
    }
  });

  it.each([
    ['si', si, []],
    ['ta', ta, tamilKeysAwaitingSourcedTerms],
  ])('%s translates every English key', (_, translations, awaitingKeys) => {
    const translatedKeys = flattenKeys(translations as Translations);
    const missingKeys = Object.keys(englishKeys).filter((key) => !(key in translatedKeys));
    expect(missingKeys).toEqual(awaitingKeys);
  });

  it.each([
    ['si', si],
    ['ta', ta],
  ])('%s only contains keys that exist in English', (_, translations) => {
    const unknownKeys = Object.keys(flattenKeys(translations as Translations)).filter(
      (key) => !(key in englishKeys),
    );
    expect(unknownKeys).toEqual([]);
  });

  it.each([
    ['si', si],
    ['ta', ta],
  ])('%s keeps every {{placeholder}} from English', (_, translations) => {
    for (const [key, value] of Object.entries(flattenKeys(translations as Translations))) {
      const placeholders = (text: string) => (text.match(/{{\s*\w+\s*}}/g) ?? []).sort();
      expect({ key, placeholders: placeholders(value) }).toEqual({
        key,
        placeholders: placeholders(englishKeys[key]),
      });
    }
  });
});

describe('color palettes', () => {
  it('define the same tokens in light and dark', () => {
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
  });

  it('use six-digit hex colors', () => {
    for (const color of [...Object.values(light), ...Object.values(dark)]) {
      expect(color).toMatch(/^#[0-9A-F]{6}$/);
    }
  });
});

describe('source code', () => {
  it('uses theme tokens instead of hardcoded colors', () => {
    const hardcodedColor = /#[0-9a-fA-F]{3,8}\b|\b(?:text|bg|border)-(?:white|black)\b|rgba?\(/;
    const offenders = componentFiles.filter((file) =>
      hardcodedColor.test(fs.readFileSync(file, 'utf8')),
    );
    expect(offenders.map((file) => path.relative(sourceDirectory, file))).toEqual([]);
  });

  it('keeps UI text out of components', () => {
    const hardcodedJsxText = />\s*[A-Za-z][A-Za-z ]{2,}\s*</;
    const offenders = componentFiles.filter((file) =>
      hardcodedJsxText.test(fs.readFileSync(file, 'utf8')),
    );
    expect(offenders.map((file) => path.relative(sourceDirectory, file))).toEqual([]);
  });

  it('uses the language-aware Text component', () => {
    const textFromReactNative = /import \{[^}]*\bText\b[^}]*\} from 'react-native'/;
    const offenders = componentFiles.filter(
      (file) =>
        !file.endsWith(path.join('components', 'text.tsx')) &&
        textFromReactNative.test(fs.readFileSync(file, 'utf8')),
    );
    expect(offenders.map((file) => path.relative(sourceDirectory, file))).toEqual([]);
  });
});

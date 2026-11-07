import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { NotoSansSinhala_400Regular } from '@expo-google-fonts/noto-sans-sinhala/400Regular';
import { NotoSansSinhala_500Medium } from '@expo-google-fonts/noto-sans-sinhala/500Medium';
import { NotoSansSinhala_600SemiBold } from '@expo-google-fonts/noto-sans-sinhala/600SemiBold';
import { NotoSansSinhala_700Bold } from '@expo-google-fonts/noto-sans-sinhala/700Bold';
import { NotoSansTamil_400Regular } from '@expo-google-fonts/noto-sans-tamil/400Regular';
import { NotoSansTamil_500Medium } from '@expo-google-fonts/noto-sans-tamil/500Medium';
import { NotoSansTamil_600SemiBold } from '@expo-google-fonts/noto-sans-tamil/600SemiBold';
import { NotoSansTamil_700Bold } from '@expo-google-fonts/noto-sans-tamil/700Bold';
import type { FontFamilyDefinition } from 'expo-font';

import { fontFamilies } from '@/constants/fonts';
import type { Language } from '@/settings/settings-storage';

export const fontFamilyDefinitions: FontFamilyDefinition[] = [
  {
    fontFamily: fontFamilies.sans,
    fontDefinitions: [
      { path: Inter_400Regular, weight: 400 },
      { path: Inter_500Medium, weight: 500 },
      { path: Inter_600SemiBold, weight: 600 },
      { path: Inter_700Bold, weight: 700 },
    ],
  },
  {
    fontFamily: fontFamilies.sinhala,
    fontDefinitions: [
      { path: NotoSansSinhala_400Regular, weight: 400 },
      { path: NotoSansSinhala_500Medium, weight: 500 },
      { path: NotoSansSinhala_600SemiBold, weight: 600 },
      { path: NotoSansSinhala_700Bold, weight: 700 },
    ],
  },
  {
    fontFamily: fontFamilies.tamil,
    fontDefinitions: [
      { path: NotoSansTamil_400Regular, weight: 400 },
      { path: NotoSansTamil_500Medium, weight: 500 },
      { path: NotoSansTamil_600SemiBold, weight: 600 },
      { path: NotoSansTamil_700Bold, weight: 700 },
    ],
  },
];

type LanguageFont = { fontFamily: string; className: string };

const fontByLanguage: Record<Language, LanguageFont> = {
  en: { fontFamily: fontFamilies.sans, className: 'font-sans' },
  si: { fontFamily: fontFamilies.sinhala, className: 'font-sinhala' },
  ta: { fontFamily: fontFamilies.tamil, className: 'font-tamil' },
};

export function getLanguageFont(language: string): LanguageFont {
  return fontByLanguage[language as Language] ?? fontByLanguage.en;
}

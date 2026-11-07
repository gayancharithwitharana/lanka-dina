export type Translations = { en: string | null; si: string | null; ta: string | null };

export function pickTranslation(language: string, translations: Translations): string {
  const translation =
    language in translations ? translations[language as keyof Translations] : null;
  return translation ?? translations.en ?? '';
}

import type { Planet, TraditionalRules } from '@/data/traditional-rules';
import { pickTranslation } from '@/data/translations';
import { db } from '@/db/client';
import { traditionalRules } from '@/db/schema';
import { getKalaHorawaAt, getRahuKalayaSpan, toClockTime } from '@/utils/traditional-times';

export type TimeRange = { start: string; end: string };

function getRules(): TraditionalRules | null {
  return db.select().from(traditionalRules).get()?.rules ?? null;
}

export function getRahuKalaya(date: Date): TimeRange | null {
  const rules = getRules();
  if (!rules) return null;
  const span = getRahuKalayaSpan(date, rules);
  return span ? { start: toClockTime(span.start), end: toClockTime(span.end) } : null;
}

export function getKalaHorawa(now: Date): Planet | null {
  const rules = getRules();
  return rules ? getKalaHorawaAt(now, rules) : null;
}

export function getMaruDirection(weekday: number): string | null {
  return getRules()?.maru[weekday] ?? null;
}

export function getCalculationPlace(language: string): string | null {
  const name = getRules()?.location.name;
  return name
    ? pickTranslation(language, { en: name.en, si: name.si ?? null, ta: name.ta ?? null })
    : null;
}

import { and, asc, eq, gte, like } from 'drizzle-orm';

import { pickTranslation } from '@/data/translations';
import { db } from '@/db/client';
import { holidays as holidaysTable, type HolidayRow } from '@/db/schema';
import type { YearMonth } from '@/utils/calendar';

export type HolidayType = 'public' | 'poya';

export type Holiday = {
  id: string;
  date: string;
  name: string;
  type: HolidayType;
  isPublic: boolean;
  isBank: boolean;
  isMercantile: boolean;
  about?: string;
};

export function getHolidaysInMonth({ year, monthIndex }: YearMonth, language: string): Holiday[] {
  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}-`;
  return selectHolidays(like(holidaysTable.date, `${monthPrefix}%`), language);
}

export function getHolidaysByDate(isoDate: string, language: string): Holiday[] {
  return selectHolidays(eq(holidaysTable.date, isoDate), language);
}

export function getHolidaysFrom(isoDate: string, language: string): Holiday[] {
  return selectHolidays(gte(holidaysTable.date, isoDate), language);
}

function selectHolidays(condition: ReturnType<typeof and>, language: string): Holiday[] {
  return db
    .select()
    .from(holidaysTable)
    .where(condition)
    .orderBy(asc(holidaysTable.date), asc(holidaysTable.id))
    .all()
    .map((row) => toHoliday(row, language));
}

function toHoliday(row: HolidayRow, language: string): Holiday {
  const name = pickTranslation(language, { en: row.nameEn, si: row.nameSi, ta: row.nameTa });
  const about = pickTranslation(language, { en: row.aboutEn, si: row.aboutSi, ta: row.aboutTa });
  return {
    id: row.id,
    date: row.date,
    name,
    type: row.type,
    isPublic: row.isPublic,
    isBank: row.isBank,
    isMercantile: row.isMercantile,
    ...(about ? { about } : {}),
  };
}

export function getDayOfMonth(holiday: Holiday): number {
  return Number(holiday.date.slice(8, 10));
}

export function getDotTypeByDay(holidaysInMonth: Holiday[]): Map<number, HolidayType> {
  const dotTypeByDay = new Map<number, HolidayType>();
  for (const holiday of holidaysInMonth) {
    const day = getDayOfMonth(holiday);
    if (dotTypeByDay.get(day) !== 'poya') {
      dotTypeByDay.set(day, holiday.type);
    }
  }
  return dotTypeByDay;
}

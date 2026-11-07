import sampleHolidays from '@/data/sample-holidays.json';
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

const holidays = sampleHolidays as Holiday[];

export function getHolidaysInMonth({ year, monthIndex }: YearMonth): Holiday[] {
  const monthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}-`;
  return holidays.filter((holiday) => holiday.date.startsWith(monthPrefix));
}

export function getDayOfMonth(holiday: Holiday): number {
  return Number(holiday.date.slice(8, 10));
}

export function getHolidaysByDate(isoDate: string): Holiday[] {
  return holidays.filter((holiday) => holiday.date === isoDate);
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

export function getHolidaysFrom(isoDate: string): Holiday[] {
  return holidays
    .filter((holiday) => holiday.date >= isoDate)
    .sort((first, second) => first.date.localeCompare(second.date));
}

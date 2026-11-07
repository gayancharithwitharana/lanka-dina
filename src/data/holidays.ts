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

export function getHolidayByDate(isoDate: string): Holiday | undefined {
  return holidays.find((holiday) => holiday.date === isoDate);
}

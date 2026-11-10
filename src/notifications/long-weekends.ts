import type { Holiday } from '@/data/holidays';
import { parseIsoDate, toIsoDate } from '@/utils/calendar';

export type LongWeekend = {
  startDate: string;
  endDate: string;
  holidays: Holiday[];
};

const MINIMUM_DAYS_OFF = 3;

function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}

function givesADayOff(holiday: Holiday): boolean {
  return holiday.isPublic || holiday.isMercantile;
}

function nextDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

function previousDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
}

export function findLongWeekends(holidays: Holiday[]): LongWeekend[] {
  const holidaysByDate = new Map<string, Holiday[]>();
  for (const holiday of holidays.filter(givesADayOff)) {
    holidaysByDate.set(holiday.date, [...(holidaysByDate.get(holiday.date) ?? []), holiday]);
  }

  const isDayOff = (date: Date) => isWeekend(date) || holidaysByDate.has(toIsoDate(date));
  const longWeekends: LongWeekend[] = [];
  const coveredDates = new Set<string>();

  for (const holidayDate of [...holidaysByDate.keys()].sort()) {
    if (coveredDates.has(holidayDate)) continue;

    let start = parseIsoDate(holidayDate);
    while (isDayOff(previousDay(start))) start = previousDay(start);
    let end = parseIsoDate(holidayDate);
    while (isDayOff(nextDay(end))) end = nextDay(end);

    const runHolidays: Holiday[] = [];
    let daysOff = 0;
    for (let day = start; day <= end; day = nextDay(day)) {
      const isoDate = toIsoDate(day);
      coveredDates.add(isoDate);
      runHolidays.push(...(holidaysByDate.get(isoDate) ?? []));
      daysOff += 1;
    }

    if (daysOff >= MINIMUM_DAYS_OFF) {
      longWeekends.push({
        startDate: toIsoDate(start),
        endDate: toIsoDate(end),
        holidays: runHolidays,
      });
    }
  }

  return longWeekends;
}

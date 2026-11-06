export type WeekStart = 0 | 1;

export type YearMonth = {
  year: number;
  monthIndex: number;
};

const DAYS_PER_WEEK = 7;
const KNOWN_SUNDAY = new Date(2023, 0, 1);

export function shiftMonth({ year, monthIndex }: YearMonth, monthsToAdd: number): YearMonth {
  const firstOfMonth = new Date(year, monthIndex + monthsToAdd, 1);
  return { year: firstOfMonth.getFullYear(), monthIndex: firstOfMonth.getMonth() };
}

export function getMonthName({ year, monthIndex }: YearMonth, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(year, monthIndex, 1));
}

export function getWeekdayLabels(weekStartsOn: WeekStart, locale: string): string[] {
  const formatWeekday = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  return Array.from({ length: DAYS_PER_WEEK }, (_, position) => {
    const weekday = new Date(KNOWN_SUNDAY);
    weekday.setDate(KNOWN_SUNDAY.getDate() + weekStartsOn + position);
    return formatWeekday.format(weekday);
  });
}

export function getMonthGridDays(
  { year, monthIndex }: YearMonth,
  weekStartsOn: WeekStart,
): (number | null)[] {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const leadingBlankCount = (firstWeekday - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const trailingBlankCount =
    (DAYS_PER_WEEK - ((leadingBlankCount + daysInMonth) % DAYS_PER_WEEK)) % DAYS_PER_WEEK;

  return [
    ...Array<null>(leadingBlankCount).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ...Array<null>(trailingBlankCount).fill(null),
  ];
}

export function isSameDay(date: Date, { year, monthIndex }: YearMonth, day: number): boolean {
  return date.getFullYear() === year && date.getMonth() === monthIndex && date.getDate() === day;
}

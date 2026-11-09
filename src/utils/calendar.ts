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

export function getWeekdayName(weekday: number, locale: string): string {
  const date = new Date(KNOWN_SUNDAY);
  date.setDate(KNOWN_SUNDAY.getDate() + weekday);
  return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
}

export function getWeekdayLabels(weekStartsOn: WeekStart, locale: string): string[] {
  const formatWeekday = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  return Array.from({ length: DAYS_PER_WEEK }, (_, position) => {
    const weekday = new Date(KNOWN_SUNDAY);
    weekday.setDate(KNOWN_SUNDAY.getDate() + weekStartsOn + position);
    return formatWeekday.format(weekday);
  });
}

export function getMonthGridWeeks(yearMonth: YearMonth, weekStartsOn: WeekStart): (number | null)[][] {
  const days = getMonthGridDays(yearMonth, weekStartsOn);
  return Array.from({ length: days.length / DAYS_PER_WEEK }, (_, weekIndex) =>
    days.slice(weekIndex * DAYS_PER_WEEK, (weekIndex + 1) * DAYS_PER_WEEK),
  );
}

function getMonthGridDays(
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

export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function getDaysBetween(from: Date, to: Date): number {
  const fromMidnight = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const toMidnight = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((toMidnight.getTime() - fromMidnight.getTime()) / MILLISECONDS_PER_DAY);
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    ISO_DATE_PATTERN.test(value) &&
    toIsoDate(parseIsoDate(value)) === value
  );
}

import { getDaysBetween, parseIsoDate } from '@/utils/calendar';

const MINUTES_PER_HOUR = 60;
const SUNRISE_HOUR = 6;

export const planets = ['sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter', 'mars'] as const;

export type Planet = (typeof planets)[number];

const dayRulers: Planet[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

export function toMinutes(clockTime: string): number {
  const [hours, minutes] = clockTime.split(':').map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
}

export function isWithinRange(now: Date, start: string, end: string): boolean {
  const minutesNow = now.getHours() * MINUTES_PER_HOUR + now.getMinutes();
  return minutesNow >= toMinutes(start) && minutesNow < toMinutes(end);
}

export function formatClockTime(clockTime: string, locale: string): string {
  const [hours, minutes] = clockTime.split(':').map(Number);
  // Today's date, because past dates can carry an old UTC offset (Sri Lanka was +6:00 until 2006).
  const time = new Date();
  time.setHours(hours, minutes, 0, 0);
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(time);
}

export function splitDateTime(isoDateTime: string): { date: Date; clockTime?: string } {
  const [isoDate, clockTime] = isoDateTime.split('T');
  return { date: parseIsoDate(isoDate), ...(clockTime ? { clockTime } : {}) };
}

export function getKalaHorawa(now: Date): Planet {
  const sunrise = new Date(now.getFullYear(), now.getMonth(), now.getDate(), SUNRISE_HOUR);
  if (now < sunrise) sunrise.setDate(sunrise.getDate() - 1);

  const hoursSinceSunrise = Math.floor((now.getTime() - sunrise.getTime()) / 3_600_000);
  const dayRuler = dayRulers[sunrise.getDay()];
  return planets[(planets.indexOf(dayRuler) + hoursSinceSunrise) % planets.length];
}

export function getDaysUntil(today: Date, isoDateTime: string): number {
  return getDaysBetween(today, splitDateTime(isoDateTime).date);
}

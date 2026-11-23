import { getTimes } from 'suncalc';

import type { Location, Planet, TraditionalRules } from '@/data/traditional-rules';

const PARTS_OF_DAYTIME = 8;
const HORAWAS_PER_HALF_DAY = 12;

export type TimeSpan = { start: Date; end: Date };

export function getDaytime(date: Date, { latitude, longitude }: Location): TimeSpan | null {
  const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const { sunrise, sunset } = getTimes(noon, latitude, longitude);
  return sunrise && sunset ? { start: sunrise, end: sunset } : null;
}

export function getRahuKalayaSpan(date: Date, rules: TraditionalRules): TimeSpan | null {
  const daytime = getDaytime(date, rules.location);
  if (!daytime) return null;
  const partLength = (daytime.end.getTime() - daytime.start.getTime()) / PARTS_OF_DAYTIME;
  const partIndex = rules.rahuKalayaParts[date.getDay()] - 1;
  const start = daytime.start.getTime() + partIndex * partLength;
  return { start: new Date(start), end: new Date(start + partLength) };
}

export function getKalaHorawaAt(now: Date, rules: TraditionalRules): Planet | null {
  const yesterday = shiftDays(now, -1);
  const previous = getDaytime(yesterday, rules.location);
  const today = getDaytime(now, rules.location);
  const next = getDaytime(shiftDays(now, 1), rules.location);
  if (!previous || !today || !next) return null;

  if (now < today.start) {
    const night = { start: previous.end, end: today.start };
    return horawaOf(rules, yesterday.getDay(), HORAWAS_PER_HALF_DAY + horawaIndex(now, night));
  }
  if (now >= today.end) {
    const night = { start: today.end, end: next.start };
    return horawaOf(rules, now.getDay(), HORAWAS_PER_HALF_DAY + horawaIndex(now, night));
  }
  return horawaOf(rules, now.getDay(), horawaIndex(now, today));
}

export function toClockTime(time: Date): string {
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function horawaIndex(now: Date, span: TimeSpan): number {
  const horawaLength = (span.end.getTime() - span.start.getTime()) / HORAWAS_PER_HALF_DAY;
  return Math.floor((now.getTime() - span.start.getTime()) / horawaLength);
}

function horawaOf(rules: TraditionalRules, weekday: number, index: number): Planet {
  const { horawaOrder, dayRulers } = rules;
  const first = horawaOrder.indexOf(dayRulers[weekday]);
  return horawaOrder[(first + index) % horawaOrder.length];
}

function shiftDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days, 12);
}

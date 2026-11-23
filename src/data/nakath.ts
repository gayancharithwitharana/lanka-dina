import { and, asc, eq, max } from 'drizzle-orm';

import type { Lagna } from '@/constants/lagnas';
import { getDataSource, type DataSource } from '@/data/data-sources';
import { pickTranslation } from '@/data/translations';
import { db } from '@/db/client';
import {
  ayaWaya,
  dataSources,
  maru,
  nakath as nakathTable,
  rahuKalaya,
  reminders,
  type NakathRow,
} from '@/db/schema';
import { getDaysUntil } from '@/utils/nakath-time';

export type Nakath = {
  id: string;
  key: string;
  name: string;
  startsAt: string;
  endsAt?: string;
  direction?: string;
  color?: string;
  notes?: string;
};

export type AvuruduNakath = {
  year: number;
  items: Nakath[];
  countdownKey?: string;
  source?: DataSource;
};

export type TimeRange = { start: string; end: string };

export function getLatestAvuruduYear(): number | null {
  const [{ latestYear }] = db
    .select({ latestYear: max(nakathTable.year) })
    .from(nakathTable)
    .all();
  return latestYear;
}

export function getLatestAvurudu(language: string): AvuruduNakath | null {
  const latestYear = getLatestAvuruduYear();
  if (latestYear === null) return null;

  const items = db
    .select()
    .from(nakathTable)
    .where(eq(nakathTable.year, latestYear))
    .orderBy(asc(nakathTable.sortOrder))
    .all()
    .map((row) => toNakath(row, language));
  const countdownKey = db
    .select({ countdownKey: dataSources.countdownKey })
    .from(dataSources)
    .where(and(eq(dataSources.dataset, 'nakath'), eq(dataSources.year, latestYear)))
    .get()?.countdownKey;
  const source = getDataSource('nakath', latestYear, language);
  return {
    year: latestYear,
    items,
    ...(countdownKey ? { countdownKey } : {}),
    ...(source ? { source } : {}),
  };
}

export function getCountdownNakath(
  { items, countdownKey }: AvuruduNakath,
  today: Date,
): Nakath | null {
  const named = items.find((nakath) => nakath.key === countdownKey);
  if (named) return named;
  const upcoming = items
    .filter((nakath) => getDaysUntil(today, nakath.startsAt) >= 0)
    .sort((first, second) => first.startsAt.localeCompare(second.startsAt));
  return upcoming[0] ?? null;
}

function toNakath(row: NakathRow, language: string): Nakath {
  const notes = pickTranslation(language, { en: row.notesEn, si: row.notesSi, ta: row.notesTa });
  return {
    id: row.id,
    key: row.key,
    name: pickTranslation(language, { en: row.nameEn, si: row.nameSi, ta: row.nameTa }),
    startsAt: row.startsAt,
    ...(row.endsAt ? { endsAt: row.endsAt } : {}),
    ...(row.direction ? { direction: row.direction } : {}),
    ...(row.color ? { color: row.color } : {}),
    ...(notes ? { notes } : {}),
  };
}

export function getRahuKalaya(weekday: number): TimeRange | null {
  const row = db.select().from(rahuKalaya).where(eq(rahuKalaya.weekday, weekday)).get();
  return row ? { start: row.start, end: row.end } : null;
}

export function getMaruDirection(weekday: number): string | null {
  return db.select().from(maru).where(eq(maru.weekday, weekday)).get()?.direction ?? null;
}

export function getAyaWaya(year: number, lagna: Lagna): { aya: number; waya: number } | null {
  const row = db
    .select()
    .from(ayaWaya)
    .where(and(eq(ayaWaya.year, year), eq(ayaWaya.lagna, lagna)))
    .get();
  return row ? { aya: row.aya, waya: row.waya } : null;
}

export function getNakathReminderIds(): Set<string> {
  const rows = db.select({ nakathId: reminders.nakathId }).from(reminders).all();
  return new Set(rows.flatMap((row) => (row.nakathId ? [row.nakathId] : [])));
}

export function setNakathReminder(nakath: Nakath, enabled: boolean): void {
  db.delete(reminders).where(eq(reminders.nakathId, nakath.id)).run();
  if (!enabled) return;

  const [date, time = '00:00'] = nakath.startsAt.split('T');
  db.insert(reminders).values({ nakathId: nakath.id, date, time, kind: 'custom' }).run();
}

import { and, eq, inArray, like } from 'drizzle-orm';

import type { DataFile, HolidayFile, NakathFile, TraditionalFile } from '@/data/data-files';
import { db } from '@/db/client';
import { dataSources, holidays, nakath, reminders, traditionalRules } from '@/db/schema';

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const TIMELESS_YEAR = 0;

function yearOf(file: DataFile): number {
  return file.dataset === 'traditional' ? TIMELESS_YEAR : file.year;
}

export function applyDataFile(file: DataFile): boolean {
  const stored = db
    .select({ version: dataSources.version })
    .from(dataSources)
    .where(and(eq(dataSources.dataset, file.dataset), eq(dataSources.year, yearOf(file))))
    .get();
  if (stored && stored.version >= file.version) return false;

  db.transaction((tx) => {
    if (file.dataset === 'holidays') replaceHolidays(tx, file);
    else if (file.dataset === 'nakath') replaceNakath(tx, file);
    else replaceTraditionalRules(tx, file);
    saveDataSource(tx, file);
  });
  return true;
}

function replaceHolidays(tx: Transaction, file: HolidayFile): void {
  const inYear = like(holidays.date, `${file.year}-%`);
  const newDates = new Map(file.items.map((item) => [item.id, item.date]));
  const oldIds = tx.select({ id: holidays.id }).from(holidays).where(inYear).all();

  const linkedReminders = tx
    .select()
    .from(reminders)
    .where(
      inArray(
        reminders.holidayId,
        oldIds.map(({ id }) => id),
      ),
    )
    .all();
  for (const reminder of linkedReminders) {
    if (newDates.get(reminder.holidayId ?? '') === reminder.date) continue;
    tx.update(reminders).set({ holidayId: null }).where(eq(reminders.id, reminder.id)).run();
  }

  const removedIds = oldIds.map(({ id }) => id).filter((id) => !newDates.has(id));
  tx.delete(holidays).where(inArray(holidays.id, removedIds)).run();
  for (const item of file.items) {
    tx.insert(holidays).values(item).onConflictDoUpdate({ target: holidays.id, set: item }).run();
  }
}

function replaceNakath(tx: Transaction, file: NakathFile): void {
  const newItems = new Map(file.items.map((item) => [item.id, item]));
  const oldIds = tx
    .select({ id: nakath.id })
    .from(nakath)
    .where(eq(nakath.year, file.year))
    .all()
    .map(({ id }) => id);

  const removedIds = oldIds.filter((id) => !newItems.has(id));
  tx.delete(reminders).where(inArray(reminders.nakathId, removedIds)).run();
  tx.delete(nakath).where(inArray(nakath.id, removedIds)).run();

  for (const item of file.items) {
    const row = { ...item, year: file.year };
    tx.insert(nakath).values(row).onConflictDoUpdate({ target: nakath.id, set: row }).run();
    const [date, time = '00:00'] = item.startsAt.split('T');
    tx.update(reminders).set({ date, time }).where(eq(reminders.nakathId, item.id)).run();
  }
}

function replaceTraditionalRules(tx: Transaction, file: TraditionalFile): void {
  const { location, rahuKalayaParts, dayRulers, horawaOrder, maru } = file;
  const row = { id: 1, rules: { location, rahuKalayaParts, dayRulers, horawaOrder, maru } };
  tx.insert(traditionalRules)
    .values(row)
    .onConflictDoUpdate({ target: traditionalRules.id, set: row })
    .run();
}

function saveDataSource(tx: Transaction, file: DataFile): void {
  const row = {
    dataset: file.dataset,
    year: yearOf(file),
    version: file.version,
    sourceEn: file.source.en,
    sourceSi: file.source.si ?? null,
    sourceTa: file.source.ta ?? null,
    sourceUrl: file.sourceUrl ?? null,
    retrievedAt: file.retrievedAt,
    countdownKey: file.dataset === 'nakath' ? (file.countdownKey ?? null) : null,
  };
  tx.insert(dataSources)
    .values(row)
    .onConflictDoUpdate({ target: [dataSources.dataset, dataSources.year], set: row })
    .run();
}

import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import sampleHolidays from '@/data/sample-holidays.json';
import { db } from '@/db/client';
import migrations from '@/db/migrations/migrations';
import { holidays, type NewHolidayRow } from '@/db/schema';

export const bundledHolidays = sampleHolidays as NewHolidayRow[];

export async function prepareDatabase(): Promise<void> {
  await migrate(db, migrations);
  upsertHolidays(bundledHolidays);
}

export function upsertHolidays(rows: NewHolidayRow[]): void {
  db.transaction((tx) => {
    for (const row of rows) {
      tx.insert(holidays).values(row).onConflictDoUpdate({ target: holidays.id, set: row }).run();
    }
  });
}

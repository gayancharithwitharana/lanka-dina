import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import sampleHolidays from '@/data/sample-holidays.json';
import sampleNakath from '@/data/sample-nakath.json';
import { db } from '@/db/client';
import migrations from '@/db/migrations/migrations';
import {
  ayaWaya,
  holidays,
  maru,
  nakath,
  rahuKalaya,
  type AyaWayaRow,
  type MaruRow,
  type NewHolidayRow,
  type NewNakathRow,
  type RahuKalayaRow,
} from '@/db/schema';

export type NakathData = {
  avurudu: NewNakathRow[];
  rahuKalaya: RahuKalayaRow[];
  maru: MaruRow[];
  ayaWaya: AyaWayaRow[];
};

export const bundledHolidays = sampleHolidays as NewHolidayRow[];
export const bundledNakath = sampleNakath as NakathData;

export async function prepareDatabase(): Promise<void> {
  await migrate(db, migrations);
  upsertHolidays(bundledHolidays);
  upsertNakathData(bundledNakath);
}

export function upsertHolidays(rows: NewHolidayRow[]): void {
  db.transaction((tx) => {
    for (const row of rows) {
      tx.insert(holidays).values(row).onConflictDoUpdate({ target: holidays.id, set: row }).run();
    }
  });
}

export function upsertNakathData(data: NakathData): void {
  db.transaction((tx) => {
    for (const row of data.avurudu) {
      tx.insert(nakath).values(row).onConflictDoUpdate({ target: nakath.id, set: row }).run();
    }
    for (const row of data.rahuKalaya) {
      tx.insert(rahuKalaya)
        .values(row)
        .onConflictDoUpdate({ target: rahuKalaya.weekday, set: row })
        .run();
    }
    for (const row of data.maru) {
      tx.insert(maru).values(row).onConflictDoUpdate({ target: maru.weekday, set: row }).run();
    }
    for (const row of data.ayaWaya) {
      tx.insert(ayaWaya)
        .values(row)
        .onConflictDoUpdate({ target: [ayaWaya.year, ayaWaya.lagna], set: row })
        .run();
    }
  });
}

import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import { bundledDataFiles } from '@/data/data-files';
import sampleTraditional from '@/data/sample-traditional.json';
import { applyDataFile } from '@/db/apply-data-file';
import { db } from '@/db/client';
import migrations from '@/db/migrations/migrations';
import {
  ayaWaya,
  maru,
  rahuKalaya,
  type AyaWayaRow,
  type MaruRow,
  type RahuKalayaRow,
} from '@/db/schema';

export type TraditionalData = {
  rahuKalaya: RahuKalayaRow[];
  maru: MaruRow[];
  ayaWaya: AyaWayaRow[];
};

export const bundledTraditional = sampleTraditional as TraditionalData;

export async function prepareDatabase(): Promise<void> {
  await migrate(db, migrations);
  for (const file of bundledDataFiles) applyDataFile(file);
  upsertTraditionalData(bundledTraditional);
}

export function upsertTraditionalData(data: TraditionalData): void {
  db.transaction((tx) => {
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

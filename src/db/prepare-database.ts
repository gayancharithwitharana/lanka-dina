import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import { bundledDataFiles } from '@/data/data-files';
import sampleAyaWaya from '@/data/sample-aya-waya.json';
import { applyDataFile } from '@/db/apply-data-file';
import { db } from '@/db/client';
import migrations from '@/db/migrations/migrations';
import { ayaWaya, type AyaWayaRow } from '@/db/schema';

export const bundledAyaWaya = sampleAyaWaya as AyaWayaRow[];

export async function prepareDatabase(): Promise<void> {
  await migrate(db, migrations);
  for (const file of bundledDataFiles) applyDataFile(file);
  upsertAyaWaya(bundledAyaWaya);
}

export function upsertAyaWaya(rows: AyaWayaRow[]): void {
  db.transaction((tx) => {
    for (const row of rows) {
      tx.insert(ayaWaya)
        .values(row)
        .onConflictDoUpdate({ target: [ayaWaya.year, ayaWaya.lagna], set: row })
        .run();
    }
  });
}

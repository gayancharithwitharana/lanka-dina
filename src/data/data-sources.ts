import { and, asc, eq } from 'drizzle-orm';

import { pickTranslation } from '@/data/translations';
import { db } from '@/db/client';
import { dataSources, type DataSourceRow } from '@/db/schema';

export type Dataset = DataSourceRow['dataset'];

export type DataSource = { year: number; name: string; url?: string; retrievedAt: string };

export function getDataSources(dataset: Dataset, language: string): DataSource[] {
  return db
    .select()
    .from(dataSources)
    .where(eq(dataSources.dataset, dataset))
    .orderBy(asc(dataSources.year))
    .all()
    .map((row) => toDataSource(row, language));
}

export function getDataSource(dataset: Dataset, year: number, language: string): DataSource | null {
  const row = db
    .select()
    .from(dataSources)
    .where(and(eq(dataSources.dataset, dataset), eq(dataSources.year, year)))
    .get();
  return row ? toDataSource(row, language) : null;
}

function toDataSource(row: DataSourceRow, language: string): DataSource {
  return {
    year: row.year,
    name: pickTranslation(language, { en: row.sourceEn, si: row.sourceSi, ta: row.sourceTa }),
    ...(row.sourceUrl ? { url: row.sourceUrl } : {}),
    retrievedAt: row.retrievedAt,
  };
}

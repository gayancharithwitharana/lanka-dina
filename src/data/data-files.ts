import sampleHolidays2026 from '../../data/sample-holidays-2026.json';
import sampleHolidays2027 from '../../data/sample-holidays-2027.json';
import sampleNakath2027 from '../../data/sample-nakath-2027.json';
import type { NewHolidayRow, NewNakathRow } from '@/db/schema';

export type TranslatedText = { en: string; si?: string; ta?: string };

type DataFileHeader = {
  year: number;
  version: number;
  source: TranslatedText;
  sourceUrl?: string;
  retrievedAt: string;
};

export type HolidayFile = DataFileHeader & { dataset: 'holidays'; items: NewHolidayRow[] };

export type NakathFile = DataFileHeader & {
  dataset: 'nakath';
  countdownKey?: string;
  items: Omit<NewNakathRow, 'year'>[];
};

export type DataFile = HolidayFile | NakathFile;

export const bundledDataFiles = [
  sampleHolidays2026,
  sampleHolidays2027,
  sampleNakath2027,
] as DataFile[];

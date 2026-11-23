import { z } from 'zod';

import type { DataFile } from '@/data/data-files';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const isoDateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/);
const translatedText = z.object({
  en: z.string().min(1),
  si: z.string().optional(),
  ta: z.string().optional(),
});
const optionalText = z.string().nullish();
const planet = z.enum(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']);

const header = {
  version: z.number().int().positive(),
  source: translatedText,
  sourceUrl: z.url().optional(),
  retrievedAt: isoDate,
};

const holidayFile = z.object({
  ...header,
  dataset: z.literal('holidays'),
  year: z.number().int(),
  items: z.array(
    z.object({
      id: z.string().min(1),
      date: isoDate,
      nameEn: z.string().min(1),
      nameSi: optionalText,
      nameTa: optionalText,
      type: z.enum(['poya', 'public']),
      isPublic: z.boolean(),
      isBank: z.boolean(),
      isMercantile: z.boolean(),
      aboutEn: optionalText,
      aboutSi: optionalText,
      aboutTa: optionalText,
    }),
  ),
});

const nakathFile = z.object({
  ...header,
  dataset: z.literal('nakath'),
  year: z.number().int(),
  countdownKey: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string().min(1),
      key: z.string().min(1),
      sortOrder: z.number().int(),
      nameEn: z.string().min(1),
      nameSi: optionalText,
      nameTa: optionalText,
      startsAt: isoDateTime,
      endsAt: isoDateTime.nullish(),
      direction: optionalText,
      color: optionalText,
      notesEn: optionalText,
      notesSi: optionalText,
      notesTa: optionalText,
    }),
  ),
});

const weekdays = <Item extends z.ZodType>(item: Item) => z.array(item).length(7);

const traditionalFile = z.object({
  ...header,
  dataset: z.literal('traditional'),
  location: z.object({
    name: translatedText,
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
  rahuKalayaParts: weekdays(z.number().int().min(1).max(8)),
  dayRulers: weekdays(planet),
  horawaOrder: weekdays(planet),
  maru: weekdays(z.string().nullable()),
});

const dataFile: z.ZodType<DataFile> = z.discriminatedUnion('dataset', [
  holidayFile,
  nakathFile,
  traditionalFile,
]);

const manifest = z.object({
  files: z.array(
    z.object({
      path: z.string().regex(/^[a-z0-9-]+\.json$/),
      dataset: z.enum(['holidays', 'nakath', 'traditional']),
      year: z.number().int(),
      version: z.number().int().positive(),
    }),
  ),
});

export type Manifest = z.infer<typeof manifest>;

export function parseDataFile(json: unknown): DataFile {
  return dataFile.parse(json);
}

export function parseManifest(json: unknown): Manifest {
  return manifest.parse(json);
}

import { integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const holidays = sqliteTable('holidays', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  nameEn: text('name_en').notNull(),
  nameSi: text('name_si'),
  nameTa: text('name_ta'),
  type: text('type', { enum: ['poya', 'public'] }).notNull(),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull(),
  isBank: integer('is_bank', { mode: 'boolean' }).notNull(),
  isMercantile: integer('is_mercantile', { mode: 'boolean' }).notNull(),
  poyaStart: text('poya_start'),
  poyaEnd: text('poya_end'),
  aboutEn: text('about_en'),
  aboutSi: text('about_si'),
  aboutTa: text('about_ta'),
});

export const notes = sqliteTable(
  'notes',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(),
    text: text('text').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [uniqueIndex('notes_date_unique').on(table.date)],
);

export const nakath = sqliteTable('nakath', {
  id: text('id').primaryKey(),
  year: integer('year').notNull(),
  sortOrder: integer('sort_order').notNull(),
  key: text('key').notNull(),
  nameEn: text('name_en').notNull(),
  nameSi: text('name_si'),
  nameTa: text('name_ta'),
  startsAt: text('starts_at').notNull(),
  endsAt: text('ends_at'),
  direction: text('direction'),
  color: text('color'),
  notesEn: text('notes_en'),
  notesSi: text('notes_si'),
  notesTa: text('notes_ta'),
});

export const rahuKalaya = sqliteTable('rahu_kalaya', {
  weekday: integer('weekday').primaryKey(),
  start: text('start').notNull(),
  end: text('end').notNull(),
});

export const maru = sqliteTable('maru', {
  weekday: integer('weekday').primaryKey(),
  direction: text('direction').notNull(),
});

export const ayaWaya = sqliteTable(
  'aya_waya',
  {
    year: integer('year').notNull(),
    lagna: text('lagna').notNull(),
    aya: integer('aya').notNull(),
    waya: integer('waya').notNull(),
  },
  (table) => [primaryKey({ columns: [table.year, table.lagna] })],
);

export const reminders = sqliteTable('reminders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  holidayId: text('holiday_id').references(() => holidays.id),
  nakathId: text('nakath_id').references(() => nakath.id),
  date: text('date').notNull(),
  time: text('time').notNull(),
  kind: text('kind', { enum: ['auto', 'custom'] }).notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
});

export type HolidayRow = typeof holidays.$inferSelect;
export type NewHolidayRow = typeof holidays.$inferInsert;
export type NakathRow = typeof nakath.$inferSelect;
export type NewNakathRow = typeof nakath.$inferInsert;
export type RahuKalayaRow = typeof rahuKalaya.$inferSelect;
export type MaruRow = typeof maru.$inferSelect;
export type AyaWayaRow = typeof ayaWaya.$inferSelect;

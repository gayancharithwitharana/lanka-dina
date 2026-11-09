import { and, asc, eq, gte, isNull } from 'drizzle-orm';

import { getHolidaysByDate, type HolidayType } from '@/data/holidays';
import { getNote } from '@/data/notes';
import { pickTranslation } from '@/data/translations';
import { db } from '@/db/client';
import { nakath, reminders } from '@/db/schema';

export type DayReminder = {
  kind: 'day';
  date: string;
  time: string;
  holidayName?: string;
  holidayType?: HolidayType;
  note?: string;
};

export type NakathReminder = {
  kind: 'nakath';
  nakathId: string;
  name: string;
  startsAt: string;
};

export type ScheduledReminder = DayReminder | NakathReminder;

export function getDayReminders(fromIsoDate: string, language: string): DayReminder[] {
  return db
    .select()
    .from(reminders)
    .where(
      and(
        eq(reminders.kind, 'custom'),
        isNull(reminders.nakathId),
        gte(reminders.date, fromIsoDate),
      ),
    )
    .orderBy(asc(reminders.date), asc(reminders.time))
    .all()
    .map((row) => {
      const [holiday] = getHolidaysByDate(row.date, language);
      const note = getNote(row.date);
      return {
        kind: 'day',
        date: row.date,
        time: row.time,
        ...(holiday ? { holidayName: holiday.name, holidayType: holiday.type } : {}),
        ...(note ? { note } : {}),
      };
    });
}

export function getNakathReminders(language: string): NakathReminder[] {
  return db
    .select({ nakath })
    .from(reminders)
    .innerJoin(nakath, eq(reminders.nakathId, nakath.id))
    .orderBy(asc(nakath.startsAt))
    .all()
    .map(({ nakath: row }) => ({
      kind: 'nakath',
      nakathId: row.id,
      name: pickTranslation(language, { en: row.nameEn, si: row.nameSi, ta: row.nameTa }),
      startsAt: row.startsAt,
    }));
}

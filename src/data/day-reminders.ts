import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@/db/client';
import { reminders } from '@/db/schema';

export const DEFAULT_REMINDER_TIME = '08:00';

const dayReminderOn = (isoDate: string) =>
  and(eq(reminders.date, isoDate), eq(reminders.kind, 'custom'), isNull(reminders.nakathId));

export function getDayReminderTime(isoDate: string): string | null {
  return db.select().from(reminders).where(dayReminderOn(isoDate)).get()?.time ?? null;
}

export function setDayReminder(isoDate: string, holidayId: string | null, enabled: boolean): void {
  db.delete(reminders).where(dayReminderOn(isoDate)).run();
  if (!enabled) return;

  db.insert(reminders)
    .values({ date: isoDate, time: DEFAULT_REMINDER_TIME, kind: 'custom', holidayId })
    .run();
}

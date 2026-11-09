import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@/db/client';
import { reminders } from '@/db/schema';

export const DEFAULT_REMINDER_TIME = '08:00';

const dayReminderOn = (isoDate: string) =>
  and(eq(reminders.date, isoDate), eq(reminders.kind, 'custom'), isNull(reminders.nakathId));

export function getDayReminderTime(isoDate: string): string | null {
  return db.select().from(reminders).where(dayReminderOn(isoDate)).get()?.time ?? null;
}

export function saveDayReminder(isoDate: string, time: string, holidayId: string | null): void {
  deleteDayReminder(isoDate);
  db.insert(reminders).values({ date: isoDate, time, kind: 'custom', holidayId }).run();
}

export function deleteDayReminder(isoDate: string): void {
  db.delete(reminders).where(dayReminderOn(isoDate)).run();
}

import type { TFunction } from 'i18next';

import type { Holiday } from '@/data/holidays';
import type { DayReminder, NakathReminder } from '@/data/scheduled-reminders';
import { findLongWeekends } from '@/notifications/long-weekends';
import { parseIsoDate } from '@/utils/calendar';
import { formatClockTime, splitDateTime } from '@/utils/nakath-time';

export const POYA_REMINDER_TIME = '19:00';
export const LONG_WEEKEND_REMINDER_TIME = '09:00';
export const LONG_WEEKEND_DAYS_AHEAD = 14;
export const NAKATH_LEAD_MINUTES = 15;
export const ALL_DAY_NAKATH_REMINDER_TIME = '08:00';
// iOS keeps only the 64 soonest local notifications; leave room for the system.
export const MAX_SCHEDULED_NOTIFICATIONS = 60;

export type PlannedNotification = {
  id: string;
  date: Date;
  title: string;
  body: string;
  url: string;
};

type PlanInput = {
  now: Date;
  holidays: Holiday[];
  dayReminders: DayReminder[];
  nakathReminders: NakathReminder[];
  poyaReminders: boolean;
  longWeekendReminders: boolean;
  t: TFunction;
  locale: string;
};

function atTime(isoDate: string, clockTime: string, daysBefore = 0): Date {
  const date = parseIsoDate(isoDate);
  const [hours, minutes] = clockTime.split(':').map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysBefore, hours, minutes);
}

function formatDay(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(parseIsoDate(isoDate));
}

export function planNotifications(input: PlanInput): PlannedNotification[] {
  const { now } = input;
  return [
    ...(input.poyaReminders ? planPoyaNotifications(input) : []),
    ...(input.longWeekendReminders ? planLongWeekendNotifications(input) : []),
    ...planDayReminderNotifications(input),
    ...planNakathNotifications(input),
  ]
    .filter((notification) => notification.date > now)
    .sort((first, second) => first.date.getTime() - second.date.getTime())
    .slice(0, MAX_SCHEDULED_NOTIFICATIONS);
}

function planPoyaNotifications({ holidays, t }: PlanInput): PlannedNotification[] {
  return holidays
    .filter((holiday) => holiday.type === 'poya')
    .map((poya) => ({
      id: `poya-${poya.id}`,
      date: atTime(poya.date, POYA_REMINDER_TIME, 1),
      title: t('notifications.poyaTitle', { name: poya.name }),
      body: t('notifications.poyaBody'),
      url: `/day/${poya.date}`,
    }));
}

function planLongWeekendNotifications({ holidays, t, locale }: PlanInput): PlannedNotification[] {
  return findLongWeekends(holidays).map((longWeekend) => ({
    id: `long-weekend-${longWeekend.startDate}`,
    date: atTime(longWeekend.startDate, LONG_WEEKEND_REMINDER_TIME, LONG_WEEKEND_DAYS_AHEAD),
    title: t('notifications.longWeekendTitle'),
    body: t('notifications.longWeekendBody', {
      start: formatDay(longWeekend.startDate, locale),
      end: formatDay(longWeekend.endDate, locale),
      names: longWeekend.holidays.map((holiday) => holiday.name).join(', '),
    }),
    url: `/day/${longWeekend.holidays[0].date}`,
  }));
}

function planDayReminderNotifications({
  dayReminders,
  t,
  locale,
}: PlanInput): PlannedNotification[] {
  return dayReminders.map((reminder) => ({
    id: `day-${reminder.date}`,
    date: atTime(reminder.date, reminder.time),
    title:
      reminder.holidayName ??
      t('notifications.dayTitle', { date: formatDay(reminder.date, locale) }),
    body: reminder.note ?? formatDay(reminder.date, locale),
    url: `/day/${reminder.date}`,
  }));
}

function planNakathNotifications({ nakathReminders, t, locale }: PlanInput): PlannedNotification[] {
  return nakathReminders.map((reminder) => {
    const { clockTime } = splitDateTime(reminder.startsAt);
    const [isoDate] = reminder.startsAt.split('T');
    const date = clockTime
      ? new Date(atTime(isoDate, clockTime).getTime() - NAKATH_LEAD_MINUTES * 60_000)
      : atTime(isoDate, ALL_DAY_NAKATH_REMINDER_TIME);
    return {
      id: `nakath-${reminder.nakathId}`,
      date,
      title: clockTime
        ? t('notifications.nakathSoonTitle', { name: reminder.name, minutes: NAKATH_LEAD_MINUTES })
        : t('notifications.nakathTodayTitle', { name: reminder.name }),
      body: clockTime
        ? t('notifications.nakathBody', { time: formatClockTime(clockTime, locale) })
        : t('nakath.allDay'),
      url: '/nakath',
    };
  });
}

import i18n from '@/i18n';
import type { Holiday } from '@/data/holidays';
import type { DayReminder, NakathReminder } from '@/data/scheduled-reminders';
import {
  MAX_SCHEDULED_NOTIFICATIONS,
  planNotifications,
  type PlannedNotification,
} from '@/notifications/plan-notifications';

const poya: Holiday = {
  id: 'poya',
  date: '2026-11-24',
  name: 'Il Full Moon Poya',
  type: 'poya',
  isPublic: true,
  isBank: true,
  isMercantile: true,
};

const fridayHoliday: Holiday = {
  id: 'friday',
  date: '2026-12-04',
  name: 'Friday Holiday',
  type: 'public',
  isPublic: true,
  isBank: true,
  isMercantile: false,
};

function plan(changes: Partial<Parameters<typeof planNotifications>[0]> = {}) {
  return planNotifications({
    now: new Date(2026, 10, 9, 9, 0),
    holidays: [],
    dayReminders: [],
    nakathReminders: [],
    poyaReminders: false,
    longWeekendReminders: false,
    t: i18n.t,
    locale: 'en',
    ...changes,
  });
}

const summary = (notifications: PlannedNotification[]) =>
  notifications.map(({ id, date, title, body, url }) => ({
    id,
    date: date.toString(),
    title,
    body,
    url,
  }));

describe('Poya reminders', () => {
  it('fires at 7:00 PM the evening before', () => {
    expect(summary(plan({ holidays: [poya], poyaReminders: true }))).toEqual([
      {
        id: 'poya-poya',
        date: new Date(2026, 10, 23, 19, 0).toString(),
        title: 'Il Full Moon Poya tomorrow',
        body: 'Poya day begins tomorrow',
        url: '/day/2026-11-24',
      },
    ]);
  });

  it('is skipped when turned off or already past', () => {
    expect(plan({ holidays: [poya], poyaReminders: false })).toEqual([]);
    expect(
      plan({ holidays: [poya], poyaReminders: true, now: new Date(2026, 10, 23, 19, 0) }),
    ).toEqual([]);
  });

  it('ignores holidays that are not Poya days', () => {
    expect(plan({ holidays: [fridayHoliday], poyaReminders: true })).toEqual([]);
  });
});

describe('long weekend reminders', () => {
  it('fires at 9:00 AM two weeks before the long weekend starts', () => {
    const [notification] = plan({ holidays: [fridayHoliday], longWeekendReminders: true });
    expect(notification.date).toEqual(new Date(2026, 10, 20, 9, 0));
    expect(notification.title).toBe('Long weekend in 2 weeks');
    expect(notification.body).toBe('Fri, Dec 4 – Sun, Dec 6 · Friday Holiday');
  });

  it('is off unless turned on', () => {
    expect(plan({ holidays: [fridayHoliday] })).toEqual([]);
  });
});

describe('day reminders', () => {
  const reminder: DayReminder = { kind: 'day', date: '2026-11-24', time: '06:30' };

  it('fires at the chosen time with the holiday name and note', () => {
    const [notification] = plan({
      dayReminders: [{ ...reminder, holidayName: 'Il Full Moon Poya', note: 'Observe sil' }],
    });
    expect(notification.date).toEqual(new Date(2026, 10, 24, 6, 30));
    expect(notification.title).toBe('Il Full Moon Poya');
    expect(notification.body).toBe('Observe sil');
  });

  it('names the date when the day has no holiday or note', () => {
    const [notification] = plan({ dayReminders: [reminder] });
    expect(notification.title).toBe('Reminder for Tue, Nov 24');
    expect(notification.body).toBe('Tue, Nov 24');
  });
});

describe('nakath reminders', () => {
  const hearth: NakathReminder = {
    kind: 'nakath',
    nakathId: 'hearth',
    name: 'Lighting the hearth',
    startsAt: '2027-04-14T10:15',
  };

  it('fires 15 minutes before a timed nakath', () => {
    const [notification] = plan({ nakathReminders: [hearth] });
    expect(notification.date).toEqual(new Date(2027, 3, 14, 10, 0));
    expect(notification.title).toBe('Lighting the hearth in 15 minutes');
    expect(notification.body).toBe('Nakath time 10:15 AM');
    expect(notification.url).toBe('/nakath');
  });

  it('fires at 8:00 AM for an all-day nakath', () => {
    const [notification] = plan({
      nakathReminders: [{ ...hearth, name: 'Bath for the old year', startsAt: '2027-04-13' }],
    });
    expect(notification.date).toEqual(new Date(2027, 3, 13, 8, 0));
    expect(notification.title).toBe('Bath for the old year today');
  });
});

describe('planNotifications', () => {
  it('keeps the soonest notifications, up to the iOS limit', () => {
    const dayReminders: DayReminder[] = Array.from({ length: 70 }, (_, index) => ({
      kind: 'day',
      date: `2027-01-${String((index % 28) + 1).padStart(2, '0')}`,
      time: `${String(Math.floor(index / 28) + 8).padStart(2, '0')}:00`,
    }));

    const notifications = plan({ dayReminders });

    expect(notifications).toHaveLength(MAX_SCHEDULED_NOTIFICATIONS);
    const times = notifications.map((notification) => notification.date.getTime());
    expect(times).toEqual([...times].sort((first, second) => first - second));
  });
});

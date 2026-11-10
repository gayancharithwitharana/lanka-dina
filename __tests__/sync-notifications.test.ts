import Storage from 'expo-sqlite/kv-store';
import * as Notifications from 'expo-notifications';

import { deleteDayReminder, saveDayReminder } from '@/data/day-reminders';
import { syncNotifications } from '@/notifications/sync-notifications';
import { saveSettings, loadSettings } from '@/settings/settings-storage';

const mocked = jest.mocked(Notifications);

function scheduledIds(): string[] {
  return mocked.scheduleNotificationAsync.mock.calls.map(([request]) => request.identifier!);
}

beforeEach(() => {
  (Storage as unknown as { clear: () => void }).clear();
  jest.clearAllMocks();
  jest.useFakeTimers({ now: new Date(2026, 10, 9, 9, 0), doNotFake: ['nextTick', 'setImmediate'] });
});

afterEach(() => {
  deleteDayReminder('2026-12-25');
  jest.useRealTimers();
});

describe('syncNotifications', () => {
  it('replaces every scheduled notification with the current plan', async () => {
    saveDayReminder('2026-12-25', '07:00', null);

    await syncNotifications();

    expect(mocked.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(scheduledIds()).toEqual([
      'poya-sample-2026-11-24',
      'poya-sample-2026-12-23',
      'day-2026-12-25',
      'poya-sample-2027-01-22',
    ]);
  });

  it('schedules long weekends only when turned on', async () => {
    saveSettings({ ...loadSettings(), poyaReminders: false, longWeekendReminders: true });

    await syncNotifications();

    expect(scheduledIds()).toEqual([
      'long-weekend-2026-12-25',
      'long-weekend-2027-01-15',
      'long-weekend-2027-01-22',
    ]);
  });

  it('does not ask for permission on its own', async () => {
    mocked.getPermissionsAsync.mockResolvedValueOnce({
      granted: false,
      canAskAgain: true,
    } as Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>);

    await syncNotifications();

    expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('asks for permission when the user turns a reminder on', async () => {
    mocked.getPermissionsAsync.mockResolvedValueOnce({
      granted: false,
      canAskAgain: true,
    } as Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>);

    await syncNotifications({ askPermission: true });

    expect(mocked.requestPermissionsAsync).toHaveBeenCalled();
    expect(scheduledIds()).not.toEqual([]);
  });
});

import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { getHolidaysFrom } from '@/data/holidays';
import { getDayReminders, getNakathReminders } from '@/data/scheduled-reminders';
import i18n from '@/i18n';
import { planNotifications } from '@/notifications/plan-notifications';
import { loadSettings } from '@/settings/settings-storage';
import { toIsoDate } from '@/utils/calendar';

const CHANNEL_ID = 'reminders';

export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

let pendingSync: Promise<void> = Promise.resolve();

export function syncNotifications({ askPermission = false } = {}): Promise<void> {
  pendingSync = pendingSync.then(() => scheduleAll(askPermission)).catch(() => undefined);
  return pendingSync;
}

async function scheduleAll(askPermission: boolean): Promise<void> {
  const now = new Date();
  const today = toIsoDate(now);
  const language = i18n.language;
  const settings = loadSettings();
  const planned = planNotifications({
    now,
    holidays: getHolidaysFrom(today, language),
    dayReminders: getDayReminders(today, language),
    nakathReminders: getNakathReminders(language),
    poyaReminders: settings.poyaReminders,
    longWeekendReminders: settings.longWeekendReminders,
    t: i18n.t,
    locale: language,
  });

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (planned.length === 0 || !(await hasPermission(askPermission))) return;

  for (const notification of planned) {
    await Notifications.scheduleNotificationAsync({
      identifier: notification.id,
      content: {
        title: notification.title,
        body: notification.body,
        data: { url: notification.url },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notification.date,
        channelId: CHANNEL_ID,
      },
    });
  }
}

async function hasPermission(askPermission: boolean): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: i18n.t('notifications.channelName'),
      importance: AndroidImportance.DEFAULT,
    });
  }
  const permission = await Notifications.getPermissionsAsync();
  if (permission.granted || !askPermission || !permission.canAskAgain) return permission.granted;
  return (await Notifications.requestPermissionsAsync()).granted;
}

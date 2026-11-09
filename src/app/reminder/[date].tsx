import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ScreenScrollView } from '@/components/screen-scroll-view';
import { Text } from '@/components/text';
import {
  DEFAULT_REMINDER_TIME,
  deleteDayReminder,
  getDayReminderTime,
  saveDayReminder,
} from '@/data/day-reminders';
import { getHolidaysByDate } from '@/data/holidays';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { syncNotifications } from '@/notifications/sync-notifications';
import { isValidIsoDate, parseIsoDate, toIsoDate } from '@/utils/calendar';

const NEW_REMINDER = 'new';

function close() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/reminders');
  }
}

function toClockTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function atClockTime(day: Date, clockTime: string): Date {
  const [hours, minutes] = clockTime.split(':').map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);
}

export default function ReminderEditorScreen() {
  const { date } = useLocalSearchParams();
  const { t } = useTranslation();

  if (date !== NEW_REMINDER && !isValidIsoDate(date)) {
    return (
      <ScreenScrollView>
        <Text className="px-6 pt-7 text-[15px] text-text-secondary">{t('day.invalidDate')}</Text>
      </ScreenScrollView>
    );
  }

  return <ReminderEditor isoDate={date === NEW_REMINDER ? null : date} />;
}

function ReminderEditor({ isoDate }: { isoDate: string | null }) {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const savedTime = isoDate ? getDayReminderTime(isoDate) : null;
  const [when, setWhen] = useState(() =>
    atClockTime(isoDate ? parseIsoDate(isoDate) : new Date(), savedTime ?? DEFAULT_REMINDER_TIME),
  );

  function save() {
    const date = toIsoDate(when);
    const [holiday] = getHolidaysByDate(date, i18n.language);
    if (isoDate && isoDate !== date) deleteDayReminder(isoDate);
    saveDayReminder(date, toClockTime(when), holiday?.id ?? null);
    syncNotifications({ askPermission: true });
    close();
  }

  function remove() {
    if (isoDate) deleteDayReminder(isoDate);
    syncNotifications();
    close();
  }

  return (
    <ScreenScrollView>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-7">
        <Pressable
          accessibilityRole="button"
          onPress={close}
          className="min-h-touch justify-center"
        >
          <Text className="text-[15px] text-text-secondary">{t('reminderEditor.cancel')}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={save} className="min-h-touch justify-center">
          <Text className="text-[15px] font-semibold text-holiday">{t('reminderEditor.save')}</Text>
        </Pressable>
      </View>
      <Text className="px-5 pb-3 text-[26px] font-bold tracking-[-0.3px] text-text">
        {t('reminderEditor.title')}
      </Text>

      <View className="mx-5 rounded-card border border-border px-4">
        <PickerRow label={t('reminderEditor.date')}>
          <DateTimePicker
            mode="date"
            value={when}
            minimumDate={isoDate ? undefined : new Date()}
            accentColor={colors.holiday}
            onValueChange={(_, date) => setWhen(atClockTime(date, toClockTime(when)))}
          />
        </PickerRow>
        <View className="h-px bg-border" />
        <PickerRow label={t('reminderEditor.time')}>
          <DateTimePicker
            mode="time"
            value={when}
            accentColor={colors.holiday}
            onValueChange={(_, time) => setWhen(atClockTime(when, toClockTime(time)))}
          />
        </PickerRow>
      </View>

      {savedTime && (
        <Pressable
          accessibilityRole="button"
          onPress={remove}
          className="mx-5 mt-6 h-[50px] items-center justify-center rounded-button border border-border active:bg-subtle"
        >
          <Text className="text-[15px] font-semibold text-text">{t('reminderEditor.delete')}</Text>
        </Pressable>
      )}
    </ScreenScrollView>
  );
}

function PickerRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="min-h-[52px] flex-row items-center justify-between">
      <Text className="text-[15px] text-text">{label}</Text>
      {children}
    </View>
  );
}

import { router, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { DataScope } from '@/components/data-scope';
import { AutomaticReminderRow } from '@/components/reminders/automatic-reminder-row';
import { ScheduledReminderRow } from '@/components/reminders/scheduled-reminder-row';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { Text } from '@/components/text';
import {
  getDayReminders,
  getNakathReminders,
  type ScheduledReminder,
} from '@/data/scheduled-reminders';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useToday } from '@/hooks/use-today';
import { LONG_WEEKEND_REMINDER_TIME, POYA_REMINDER_TIME } from '@/notifications/plan-notifications';
import { syncNotifications } from '@/notifications/sync-notifications';
import { useSettings } from '@/settings/settings-context';
import { toIsoDate } from '@/utils/calendar';
import { formatClockTime } from '@/utils/nakath-time';

function reminderStart(reminder: ScheduledReminder): string {
  return reminder.kind === 'day' ? `${reminder.date}T${reminder.time}` : reminder.startsAt;
}

function loadScheduledReminders(today: string, language: string): ScheduledReminder[] {
  return [
    ...getDayReminders(today, language),
    ...getNakathReminders(language).filter((reminder) => reminder.startsAt >= today),
  ].sort((first, second) => reminderStart(first).localeCompare(reminderStart(second)));
}

export default function RemindersScreen() {
  return (
    <DataScope>
      <RemindersContent />
    </DataScope>
  );
}

function RemindersContent() {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const today = toIsoDate(useToday());
  const { poyaReminders, longWeekendReminders, updateSettings } = useSettings();
  const [scheduled, setScheduled] = useState(() => loadScheduledReminders(today, i18n.language));

  useFocusEffect(
    useCallback(() => {
      setScheduled(loadScheduledReminders(today, i18n.language));
    }, [today, i18n.language]),
  );

  function toggleAutomatic(changes: { poyaReminders?: boolean; longWeekendReminders?: boolean }) {
    updateSettings(changes);
    syncNotifications({ askPermission: true });
  }

  return (
    <ScreenScrollView>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-7">
        <Text className="text-[30px] font-bold tracking-[-0.6px] text-text">
          {t('tabs.reminders')}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('reminders.newReminder')}
          onPress={() => router.push({ pathname: '/reminder/[date]', params: { date: 'new' } })}
          className="h-11 w-11 items-center justify-center rounded-full bg-inverse active:opacity-80"
        >
          <SymbolView
            name={{ ios: 'plus', android: 'add' }}
            size={20}
            tintColor={colors['on-inverse']}
          />
        </Pressable>
      </View>

      <Section title={t('reminders.automatic')}>
        <AutomaticReminderRow
          title={t('reminders.everyPoya')}
          detail={t('reminders.everyPoyaDetail', {
            time: formatClockTime(POYA_REMINDER_TIME, i18n.language),
          })}
          enabled={poyaReminders}
          onToggle={(enabled) => toggleAutomatic({ poyaReminders: enabled })}
        />
        <AutomaticReminderRow
          title={t('reminders.longWeekends')}
          detail={t('reminders.longWeekendsDetail', {
            time: formatClockTime(LONG_WEEKEND_REMINDER_TIME, i18n.language),
          })}
          enabled={longWeekendReminders}
          onToggle={(enabled) => toggleAutomatic({ longWeekendReminders: enabled })}
        />
      </Section>

      <Section title={t('reminders.scheduled')}>
        {scheduled.length === 0 ? (
          <Text className="text-[15px] text-text-muted">{t('reminders.noReminders')}</Text>
        ) : (
          scheduled.map((reminder) => (
            <ScheduledReminderRow
              key={reminder.kind === 'day' ? reminder.date : reminder.nakathId}
              reminder={reminder}
            />
          ))
        )}
      </Section>
    </ScreenScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-2 px-5 pt-4">
      <Text className="mb-0.5 mt-2 text-label uppercase text-text-muted">{title}</Text>
      {children}
    </View>
  );
}

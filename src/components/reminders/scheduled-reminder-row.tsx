import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/text';
import type { ScheduledReminder } from '@/data/scheduled-reminders';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { parseIsoDate } from '@/utils/calendar';
import { formatClockTime, splitDateTime } from '@/utils/nakath-time';

export function ScheduledReminderRow({ reminder }: { reminder: ScheduledReminder }) {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const locale = i18n.language;
  const formatDay = (date: Date) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short', month: 'short', day: 'numeric' }).format(
      date,
    );

  const isPoyaTone =
    reminder.kind === 'nakath' || (reminder.kind === 'day' && reminder.holidayType === 'poya');
  let title: string;
  let when: string;
  let open: () => void;

  if (reminder.kind === 'day') {
    const day = formatDay(parseIsoDate(reminder.date));
    title = reminder.holidayName ?? reminder.note ?? t('reminders.reminderFor', { date: day });
    when = t('reminders.when', { date: day, time: formatClockTime(reminder.time, locale) });
    open = () => router.push({ pathname: '/reminder/[date]', params: { date: reminder.date } });
  } else {
    const { date, clockTime } = splitDateTime(reminder.startsAt);
    title = reminder.name;
    when = t('reminders.when', {
      date: formatDay(date),
      time: clockTime ? formatClockTime(clockTime, locale) : t('nakath.allDay'),
    });
    open = () => router.navigate({ pathname: '/nakath', params: { view: 'avurudu' } });
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={open}
      className="flex-row items-center gap-3.5 rounded-card border border-border p-3.5 active:bg-surface"
    >
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${isPoyaTone ? 'bg-poya-tint' : 'bg-holiday-tint'}`}
      >
        <SymbolView
          name={{ ios: 'bell.fill', android: 'notifications' }}
          size={16}
          tintColor={isPoyaTone ? colors.poya : colors.holiday}
        />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-[15px] font-semibold text-text">{title}</Text>
        <Text className="text-[13px] text-text-secondary">{when}</Text>
      </View>
    </Pressable>
  );
}

import { router, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/text';
import { getDayReminderTime } from '@/data/day-reminders';
import { getNote } from '@/data/notes';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { formatClockTime } from '@/utils/nakath-time';

export function DayActions({ isoDate }: { isoDate: string }) {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const [note, setNote] = useState(() => getNote(isoDate));
  const [reminderTime, setReminderTime] = useState(() => getDayReminderTime(isoDate));

  useFocusEffect(
    useCallback(() => {
      setNote(getNote(isoDate));
      setReminderTime(getDayReminderTime(isoDate));
    }, [isoDate]),
  );

  const reminderLabel = reminderTime
    ? t('day.reminderSet', { time: formatClockTime(reminderTime, i18n.language) })
    : t('day.setReminder');

  return (
    <>
      <View className="gap-2 px-6 pt-6">
        <Text className="text-label uppercase text-text-muted">{t('day.myNote')}</Text>
        <Text
          className={`text-[15px] leading-6 ${note ? 'text-text-secondary' : 'text-text-muted'}`}
        >
          {note ?? t('day.noNote')}
        </Text>
      </View>

      <View className="flex-1" />

      <View className="flex-row gap-3 px-5 pt-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={reminderLabel}
          onPress={() => router.push({ pathname: '/reminder/[date]', params: { date: isoDate } })}
          className="h-[50px] flex-1 flex-row items-center justify-center gap-2 rounded-button bg-inverse active:opacity-80"
        >
          <SymbolView
            name={{ ios: reminderTime ? 'bell.fill' : 'bell', android: 'notifications' }}
            size={18}
            tintColor={colors['on-inverse']}
          />
          <Text className="text-[15px] font-semibold text-on-inverse">{reminderLabel}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/note/[date]', params: { date: isoDate } })}
          className="h-[50px] items-center justify-center rounded-button border border-border px-[18px] active:bg-subtle"
        >
          <Text className="text-[15px] font-semibold text-text">
            {note ? t('day.editNote') : t('day.addNote')}
          </Text>
        </Pressable>
      </View>
    </>
  );
}

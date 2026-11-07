import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import type { Holiday } from '@/data/holidays';
import { parseIsoDate } from '@/utils/calendar';

type HolidayCardProps = {
  holiday: Holiday;
  trailing: ReactNode;
};

export function HolidayCard({ holiday, trailing }: HolidayCardProps) {
  const { t, i18n } = useTranslation();
  const holidayDate = parseIsoDate(holiday.date);
  const weekdayName = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'short',
  }).format(holidayDate);
  const holidayKinds = [
    holiday.isPublic && t('holidayKinds.public'),
    holiday.isBank && t('holidayKinds.bank'),
    holiday.isMercantile && t('holidayKinds.mercantile'),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link href={{ pathname: '/day/[date]', params: { date: holiday.date } }} asChild>
      <Pressable className="flex-row items-center gap-3.5 rounded-card border border-border px-3.5 py-3 active:bg-surface">
        <View className="w-11 items-center">
          <Text className="text-[11px] font-semibold uppercase text-text-muted">{weekdayName}</Text>
          <Text className="text-xl font-bold text-text">{holidayDate.getDate()}</Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-[15px] font-semibold text-text">{holiday.name}</Text>
          <Text className="text-[13px] text-text-secondary">{holidayKinds}</Text>
        </View>
        {trailing}
      </Pressable>
    </Link>
  );
}

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { HolidayDot } from '@/components/calendar/holiday-dot';
import { HolidayCard } from '@/components/holiday-card';
import { Text } from '@/components/text';
import type { Holiday } from '@/data/holidays';

type MonthHolidayListProps = {
  holidays: Holiday[];
};

export function MonthHolidayList({ holidays }: MonthHolidayListProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-2.5 px-5 pt-5">
      <Text className="text-label uppercase text-text-muted">{t('calendar.thisMonth')}</Text>
      {holidays.length === 0 ? (
        <Text className="text-[13px] text-text-secondary">{t('calendar.noHolidaysThisMonth')}</Text>
      ) : (
        holidays.map((holiday) => (
          <HolidayCard
            key={holiday.id}
            holiday={holiday}
            trailing={<HolidayDot type={holiday.type} size="medium" />}
          />
        ))
      )}
    </View>
  );
}

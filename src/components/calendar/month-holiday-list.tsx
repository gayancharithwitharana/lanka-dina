import { Text, View } from 'react-native';

import { HolidayDot } from '@/components/calendar/holiday-dot';
import { getDayOfMonth, type Holiday } from '@/data/holidays';
import type { YearMonth } from '@/utils/calendar';

type MonthHolidayListProps = {
  yearMonth: YearMonth;
  holidays: Holiday[];
  locale: string;
};

export function MonthHolidayList({ yearMonth, holidays, locale }: MonthHolidayListProps) {
  return (
    <View className="gap-2.5 px-5 pt-5">
      <Text className="text-label uppercase text-text-muted">This month</Text>
      {holidays.length === 0 ? (
        <Text className="text-[13px] text-text-secondary">No holidays this month</Text>
      ) : (
        holidays.map((holiday) => (
          <HolidayCard key={holiday.id} yearMonth={yearMonth} holiday={holiday} locale={locale} />
        ))
      )}
    </View>
  );
}

type HolidayCardProps = {
  yearMonth: YearMonth;
  holiday: Holiday;
  locale: string;
};

function HolidayCard({ yearMonth, holiday, locale }: HolidayCardProps) {
  const dayOfMonth = getDayOfMonth(holiday);
  const weekdayName = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
    new Date(yearMonth.year, yearMonth.monthIndex, dayOfMonth),
  );

  return (
    <View className="flex-row items-center gap-3.5 rounded-card border border-border px-3.5 py-3">
      <View className="w-11 items-center">
        <Text className="text-[11px] font-semibold uppercase text-text-muted">{weekdayName}</Text>
        <Text className="text-xl font-bold text-text">{dayOfMonth}</Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-[15px] font-semibold text-text">{holiday.name}</Text>
        <Text className="text-[13px] text-text-secondary">{getHolidayKinds(holiday)}</Text>
      </View>
      <HolidayDot type={holiday.type} size="medium" />
    </View>
  );
}

function getHolidayKinds(holiday: Holiday): string {
  const kinds = [
    holiday.isPublic && 'Public',
    holiday.isBank && 'Bank',
    holiday.isMercantile && 'Mercantile',
  ];
  return kinds.filter(Boolean).join(' · ');
}

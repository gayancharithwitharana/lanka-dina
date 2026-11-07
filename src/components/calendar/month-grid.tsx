import { View } from 'react-native';

import { HolidayDot } from '@/components/calendar/holiday-dot';
import { Text } from '@/components/text';
import { getDotTypeByDay, type Holiday, type HolidayType } from '@/data/holidays';
import {
  getMonthGridWeeks,
  getWeekdayLabels,
  isSameDay,
  type WeekStart,
  type YearMonth,
} from '@/utils/calendar';

type MonthGridProps = {
  yearMonth: YearMonth;
  weekStartsOn: WeekStart;
  today: Date;
  holidays: Holiday[];
  locale: string;
};

export function MonthGrid({ yearMonth, weekStartsOn, today, holidays, locale }: MonthGridProps) {
  const weekdayLabels = getWeekdayLabels(weekStartsOn, locale);
  const weeks = getMonthGridWeeks(yearMonth, weekStartsOn);
  const holidayTypeByDay = getDotTypeByDay(holidays);

  return (
    <View className="px-3">
      <View className="flex-row">
        {weekdayLabels.map((label, position) => (
          <Text
            key={position}
            className="flex-1 py-2 text-center text-xs font-semibold text-text-muted"
          >
            {label}
          </Text>
        ))}
      </View>

      <View className="gap-1">
        {weeks.map((week, weekPosition) => (
          <View key={weekPosition} className="flex-row">
            {week.map((day, dayPosition) => (
              <DayCell
                key={dayPosition}
                day={day}
                isToday={day !== null && isSameDay(today, yearMonth, day)}
                holidayType={day === null ? undefined : holidayTypeByDay.get(day)}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const dayTextColorByHolidayType: Record<HolidayType, string> = {
  public: 'font-bold text-holiday',
  poya: 'font-bold text-poya',
};

type DayCellProps = {
  day: number | null;
  isToday: boolean;
  holidayType?: HolidayType;
};

function DayCell({ day, isToday, holidayType }: DayCellProps) {
  const dayTextStyle = isToday
    ? 'font-bold text-on-inverse'
    : holidayType
      ? dayTextColorByHolidayType[holidayType]
      : 'font-medium text-text';

  return (
    <View className="min-h-12 flex-1 items-center justify-center gap-[3px]">
      {day !== null && (
        <>
          <View
            className={`h-[34px] w-[34px] items-center justify-center rounded-full ${isToday ? 'bg-inverse' : ''}`}
          >
            <Text className={`text-[15px] ${dayTextStyle}`}>{day}</Text>
          </View>
          {holidayType ? (
            <HolidayDot type={holidayType} size="small" />
          ) : (
            <View className="h-[5px] w-[5px]" />
          )}
        </>
      )}
    </View>
  );
}

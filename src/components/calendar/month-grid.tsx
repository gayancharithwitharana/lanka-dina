import { Text, View } from 'react-native';

import {
  getMonthGridDays,
  getWeekdayLabels,
  isSameDay,
  type WeekStart,
  type YearMonth,
} from '@/utils/calendar';

type MonthGridProps = {
  yearMonth: YearMonth;
  weekStartsOn: WeekStart;
  today: Date;
  locale: string;
};

export function MonthGrid({ yearMonth, weekStartsOn, today, locale }: MonthGridProps) {
  const weekdayLabels = getWeekdayLabels(weekStartsOn, locale);
  const days = getMonthGridDays(yearMonth, weekStartsOn);

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

      <View className="flex-row flex-wrap gap-y-1">
        {days.map((day, position) => (
          <DayCell
            key={position}
            day={day}
            isToday={day !== null && isSameDay(today, yearMonth, day)}
          />
        ))}
      </View>
    </View>
  );
}

type DayCellProps = {
  day: number | null;
  isToday: boolean;
};

function DayCell({ day, isToday }: DayCellProps) {
  return (
    <View className="h-12 w-[14.2857%] items-center justify-center gap-[3px]">
      {day !== null && (
        <>
          <View
            className={`h-[34px] w-[34px] items-center justify-center rounded-full ${isToday ? 'bg-today' : ''}`}
          >
            <Text
              className={`text-[15px] ${isToday ? 'font-bold text-white' : 'font-medium text-text'}`}
            >
              {day}
            </Text>
          </View>
          <View className="h-[5px] w-[5px] rounded-full" />
        </>
      )}
    </View>
  );
}

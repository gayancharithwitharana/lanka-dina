import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HolidayLegend } from '@/components/calendar/holiday-legend';
import { MonthGrid } from '@/components/calendar/month-grid';
import { MonthHeader } from '@/components/calendar/month-header';
import { MonthHolidayList } from '@/components/calendar/month-holiday-list';
import { getHolidaysInMonth } from '@/data/holidays';
import { useSettings } from '@/settings/settings-context';
import { getMonthName, shiftMonth, type YearMonth } from '@/utils/calendar';

export default function CalendarScreen() {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const { weekStartsOn } = useSettings();
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState<YearMonth>({
    year: today.getFullYear(),
    monthIndex: today.getMonth(),
  });
  const holidaysInMonth = getHolidaysInMonth(visibleMonth);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-6">
        <View className="w-full max-w-[600px] self-center">
          <MonthHeader
            year={visibleMonth.year}
            monthName={getMonthName(visibleMonth, locale)}
            onPreviousMonth={() => setVisibleMonth((month) => shiftMonth(month, -1))}
            onNextMonth={() => setVisibleMonth((month) => shiftMonth(month, 1))}
          />
          <MonthGrid
            yearMonth={visibleMonth}
            weekStartsOn={weekStartsOn}
            today={today}
            holidays={holidaysInMonth}
            locale={locale}
          />
          <HolidayLegend />
          <MonthHolidayList holidays={holidaysInMonth} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

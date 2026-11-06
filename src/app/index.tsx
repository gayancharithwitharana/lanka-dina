import { useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HolidayLegend } from '@/components/calendar/holiday-legend';
import { MonthGrid } from '@/components/calendar/month-grid';
import { MonthHeader } from '@/components/calendar/month-header';
import { MonthHolidayList } from '@/components/calendar/month-holiday-list';
import { getHolidaysInMonth } from '@/data/holidays';
import { getMonthName, shiftMonth, type YearMonth } from '@/utils/calendar';

const LOCALE = 'en';

export default function CalendarScreen() {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState<YearMonth>({
    year: today.getFullYear(),
    monthIndex: today.getMonth(),
  });
  const holidaysInMonth = getHolidaysInMonth(visibleMonth);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-6">
        <MonthHeader
          year={visibleMonth.year}
          monthName={getMonthName(visibleMonth, LOCALE)}
          onPreviousMonth={() => setVisibleMonth((month) => shiftMonth(month, -1))}
          onNextMonth={() => setVisibleMonth((month) => shiftMonth(month, 1))}
        />
        <MonthGrid
          yearMonth={visibleMonth}
          weekStartsOn={0}
          today={today}
          holidays={holidaysInMonth}
          locale={LOCALE}
        />
        <HolidayLegend />
        <MonthHolidayList yearMonth={visibleMonth} holidays={holidaysInMonth} locale={LOCALE} />
      </ScrollView>
    </SafeAreaView>
  );
}

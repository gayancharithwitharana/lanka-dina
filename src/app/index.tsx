import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MonthGrid } from '@/components/calendar/month-grid';
import { MonthHeader } from '@/components/calendar/month-header';
import { getMonthName, shiftMonth, type YearMonth } from '@/utils/calendar';

const LOCALE = 'en';

export default function CalendarScreen() {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState<YearMonth>({
    year: today.getFullYear(),
    monthIndex: today.getMonth(),
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <MonthHeader
        year={visibleMonth.year}
        monthName={getMonthName(visibleMonth, LOCALE)}
        onPreviousMonth={() => setVisibleMonth((month) => shiftMonth(month, -1))}
        onNextMonth={() => setVisibleMonth((month) => shiftMonth(month, 1))}
      />
      <MonthGrid yearMonth={visibleMonth} weekStartsOn={0} today={today} locale={LOCALE} />
    </SafeAreaView>
  );
}

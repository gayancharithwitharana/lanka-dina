import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { HolidayLegend } from '@/components/calendar/holiday-legend';
import { MonthGrid } from '@/components/calendar/month-grid';
import { MonthHeader } from '@/components/calendar/month-header';
import { MonthHolidayList } from '@/components/calendar/month-holiday-list';
import { AdBanner } from '@/components/ads/ad-banner';
import { DataScope } from '@/components/data-scope';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { getHolidaysInMonth } from '@/data/holidays';
import { useToday } from '@/hooks/use-today';
import { useSettings } from '@/settings/settings-context';
import { getMonthName, shiftMonth, type YearMonth } from '@/utils/calendar';

export default function CalendarScreen() {
  return (
    <DataScope>
      <CalendarContent />
    </DataScope>
  );
}

function CalendarContent() {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const { weekStartsOn } = useSettings();
  const today = useToday();
  const [visibleMonth, setVisibleMonth] = useState<YearMonth>({
    year: today.getFullYear(),
    monthIndex: today.getMonth(),
  });
  const holidaysInMonth = getHolidaysInMonth(visibleMonth, locale);

  return (
    <ScreenScrollView footer={<AdBanner />}>
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
    </ScreenScrollView>
  );
}

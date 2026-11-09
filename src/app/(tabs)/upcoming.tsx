import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { HolidayCard } from '@/components/holiday-card';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { Text } from '@/components/text';
import { HolidayFilterChips, type HolidayFilter } from '@/components/upcoming/holiday-filter-chips';
import { getHolidaysFrom, type Holiday } from '@/data/holidays';
import { useToday } from '@/hooks/use-today';
import { getDaysBetween, parseIsoDate, toIsoDate } from '@/utils/calendar';

type MonthGroup = {
  title: string;
  holidays: Holiday[];
};

export default function UpcomingScreen() {
  const { t, i18n } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<HolidayFilter>('all');
  const today = useToday();

  const upcomingHolidays = getHolidaysFrom(toIsoDate(today), i18n.language).filter(
    (holiday) => selectedFilter === 'all' || holiday.type === selectedFilter,
  );
  const monthGroups = groupByMonth(upcomingHolidays, today, i18n.language);

  return (
    <ScreenScrollView>
      <View className="gap-3.5 px-5 pb-3 pt-7">
        <Text className="text-[30px] font-bold tracking-[-0.6px] text-text">
          {t('tabs.upcoming')}
        </Text>
        <HolidayFilterChips selectedFilter={selectedFilter} onSelectFilter={setSelectedFilter} />
      </View>

      <View className="gap-2 px-5 pt-1">
        {monthGroups.length === 0 && (
          <Text className="text-[13px] text-text-secondary">
            {t('upcoming.noUpcomingHolidays')}
          </Text>
        )}
        {monthGroups.map((group) => (
          <View key={group.title} className="gap-2">
            <Text className="mb-0.5 mt-2.5 text-label uppercase text-text-muted">
              {group.title}
            </Text>
            {group.holidays.map((holiday) => (
              <HolidayCard
                key={holiday.id}
                holiday={holiday}
                trailing={<Countdown holiday={holiday} today={today} />}
              />
            ))}
          </View>
        ))}
      </View>
    </ScreenScrollView>
  );
}

function Countdown({ holiday, today }: { holiday: Holiday; today: Date }) {
  const { t } = useTranslation();
  const daysUntil = getDaysBetween(today, parseIsoDate(holiday.date));
  const label =
    daysUntil === 0
      ? t('upcoming.today')
      : daysUntil === 1
        ? t('upcoming.tomorrow')
        : t('upcoming.inDays', { count: daysUntil });

  return (
    <Text
      className={`text-xs font-semibold ${holiday.type === 'poya' ? 'text-poya' : 'text-holiday'}`}
    >
      {label}
    </Text>
  );
}

function groupByMonth(holidays: Holiday[], today: Date, locale: string): MonthGroup[] {
  const monthOnly = new Intl.DateTimeFormat(locale, { month: 'long' });
  const monthAndYear = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  });
  const groups: MonthGroup[] = [];

  for (const holiday of holidays) {
    const holidayDate = parseIsoDate(holiday.date);
    const formatTitle =
      holidayDate.getFullYear() === today.getFullYear() ? monthOnly : monthAndYear;
    const title = formatTitle.format(holidayDate);
    const lastGroup = groups.at(-1);

    if (lastGroup?.title === title) {
      lastGroup.holidays.push(holiday);
    } else {
      groups.push({ title, holidays: [holiday] });
    }
  }

  return groups;
}

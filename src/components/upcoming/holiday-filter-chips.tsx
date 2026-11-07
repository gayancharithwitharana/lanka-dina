import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/text';
import type { HolidayType } from '@/data/holidays';

export type HolidayFilter = 'all' | HolidayType;

const filters: HolidayFilter[] = ['all', 'poya', 'public'];

type HolidayFilterChipsProps = {
  selectedFilter: HolidayFilter;
  onSelectFilter: (filter: HolidayFilter) => void;
};

export function HolidayFilterChips({ selectedFilter, onSelectFilter }: HolidayFilterChipsProps) {
  const { t } = useTranslation();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={t('upcoming.filterLabel')}
      className="flex-row gap-2"
    >
      {filters.map((filter) => {
        const isSelected = filter === selectedFilter;
        return (
          <Pressable
            key={filter}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            onPress={() => onSelectFilter(filter)}
            className={`h-11 justify-center rounded-pill border px-4 ${isSelected ? 'border-inverse bg-inverse' : 'border-border bg-background'}`}
          >
            <Text
              className={`text-[13px] font-semibold ${isSelected ? 'text-on-inverse' : 'text-text-secondary'}`}
            >
              {t(`upcoming.filters.${filter}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

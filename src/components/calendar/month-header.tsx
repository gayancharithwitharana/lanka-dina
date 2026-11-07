import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import colors from '@/constants/colors';

type MonthHeaderProps = {
  year: number;
  monthName: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

export function MonthHeader({ year, monthName, onPreviousMonth, onNextMonth }: MonthHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-end justify-between px-5 pb-3 pt-7">
      <View className="gap-0.5">
        <Text className="text-[13px] font-medium text-text-muted">{year}</Text>
        <Text className="text-[30px] font-bold tracking-[-0.6px] text-text">{monthName}</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <MonthNavButton label={t('calendar.previousMonth')} symbol="left" onPress={onPreviousMonth} />
        <MonthNavButton label={t('calendar.nextMonth')} symbol="right" onPress={onNextMonth} />
      </View>
    </View>
  );
}

type MonthNavButtonProps = {
  label: string;
  symbol: 'left' | 'right';
  onPress: () => void;
};

function MonthNavButton({ label, symbol, onPress }: MonthNavButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-11 w-11 items-center justify-center rounded-full active:bg-subtle"
    >
      <SymbolView
        name={{ ios: `chevron.${symbol}`, android: `chevron_${symbol}` }}
        size={22}
        tintColor={colors.text.secondary}
      />
    </Pressable>
  );
}

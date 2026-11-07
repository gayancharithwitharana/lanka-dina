import { Text, View } from 'react-native';

import { HolidayDot } from '@/components/calendar/holiday-dot';

export function HolidayLegend() {
  return (
    <View className="flex-row gap-5 px-6 pb-1 pt-3">
      <View className="flex-row items-center gap-1.5">
        <HolidayDot type="public" size="medium" />
        <Text className="text-xs text-text-secondary">Public holiday</Text>
      </View>
      <View className="flex-row items-center gap-1.5">
        <HolidayDot type="poya" size="medium" />
        <Text className="text-xs text-text-secondary">Poya day</Text>
      </View>
    </View>
  );
}

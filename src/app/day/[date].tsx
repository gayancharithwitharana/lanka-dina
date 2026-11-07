import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '@/constants/colors';
import { getHolidayByDate, type Holiday } from '@/data/holidays';
import { parseIsoDate } from '@/utils/calendar';

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { t, i18n } = useTranslation();
  const day = parseIsoDate(date);
  const holiday = getHolidayByDate(date);

  const monthAndYear = new Intl.DateTimeFormat(i18n.language, {
    month: 'long',
    year: 'numeric',
  }).format(day);
  const weekdayName = new Intl.DateTimeFormat(i18n.language, { weekday: 'long' }).format(day);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="pb-8">
        <View className="w-full max-w-[600px] self-center">
          <View className="flex-row items-center px-2 pb-2 pt-5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('day.backToCalendar')}
              onPress={() => router.back()}
              className="h-11 w-11 items-center justify-center rounded-full active:bg-subtle"
            >
              <SymbolView
                name={{ ios: 'chevron.left', android: 'chevron_left' }}
                size={22}
                tintColor={colors.text.secondary}
              />
            </Pressable>
            <Text className="text-[15px] font-semibold text-text-secondary">{monthAndYear}</Text>
          </View>

          <View className="gap-3.5 px-6 pt-4">
            <View className="flex-row items-baseline gap-3">
              <Text className="text-[64px] font-bold leading-[64px] tracking-[-2.5px] text-text">
                {day.getDate()}
              </Text>
              <Text className="text-[17px] font-medium text-text-secondary">{weekdayName}</Text>
            </View>
            {holiday && <HolidaySummary holiday={holiday} />}
          </View>

          {holiday?.about && (
            <View className="gap-2 px-6 pt-6">
              <Text className="text-label uppercase text-text-muted">{t('day.about')}</Text>
              <Text className="text-[15px] leading-6 text-text-secondary">{holiday.about}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HolidaySummary({ holiday }: { holiday: Holiday }) {
  const { t } = useTranslation();
  const holidayTypeLabels = [
    holiday.isPublic && t('holidayTypes.public'),
    holiday.isBank && t('holidayTypes.bank'),
    holiday.isMercantile && t('holidayTypes.mercantile'),
  ].filter((label): label is string => Boolean(label));

  return (
    <>
      <Text
        className={`text-[26px] font-bold tracking-[-0.3px] ${holiday.type === 'poya' ? 'text-poya' : 'text-text'}`}
      >
        {holiday.name}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {holidayTypeLabels.map((label) => (
          <View key={label} className="rounded-pill bg-subtle px-2.5 py-1.5">
            <Text className="text-xs font-semibold text-text-secondary">{label}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

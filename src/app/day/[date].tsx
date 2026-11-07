import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ScreenScrollView } from '@/components/screen-scroll-view';
import { Text } from '@/components/text';
import { getHolidaysByDate, type Holiday } from '@/data/holidays';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { isValidIsoDate, parseIsoDate } from '@/utils/calendar';

export default function DayDetailScreen() {
  const { date } = useLocalSearchParams();
  const { t } = useTranslation();

  return (
    <ScreenScrollView>
      {isValidIsoDate(date) ? (
        <DayDetail isoDate={date} />
      ) : (
        <>
          <BackHeader title="" />
          <Text className="px-6 pt-4 text-[15px] text-text-secondary">{t('day.invalidDate')}</Text>
        </>
      )}
    </ScreenScrollView>
  );
}

function DayDetail({ isoDate }: { isoDate: string }) {
  const { t, i18n } = useTranslation();
  const day = parseIsoDate(isoDate);
  const holidays = getHolidaysByDate(isoDate);

  const monthAndYear = new Intl.DateTimeFormat(i18n.language, {
    month: 'long',
    year: 'numeric',
  }).format(day);
  const weekdayName = new Intl.DateTimeFormat(i18n.language, { weekday: 'long' }).format(day);

  return (
    <>
      <BackHeader title={monthAndYear} />

      <View className="gap-3.5 px-6 pt-4">
        <View className="flex-row items-baseline gap-3">
          <Text className="text-[64px] font-bold leading-[64px] tracking-[-2.5px] text-text">
            {day.getDate()}
          </Text>
          <Text className="text-[17px] font-medium text-text-secondary">{weekdayName}</Text>
        </View>
      </View>

      {holidays.map((holiday) => (
        <View key={holiday.id} className="gap-3.5 px-6 pt-4">
          <HolidaySummary holiday={holiday} />
          {holiday.about && (
            <View className="gap-2 pt-2">
              <Text className="text-label uppercase text-text-muted">{t('day.about')}</Text>
              <Text className="text-[15px] leading-6 text-text-secondary">{holiday.about}</Text>
            </View>
          )}
        </View>
      ))}
    </>
  );
}

function goBackToCalendar() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}

function BackHeader({ title }: { title: string }) {
  const { t } = useTranslation();
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center px-2 pb-2 pt-5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('day.backToCalendar')}
        onPress={goBackToCalendar}
        className="h-11 w-11 items-center justify-center rounded-full active:bg-subtle"
      >
        <SymbolView
          name={{ ios: 'chevron.left', android: 'chevron_left' }}
          size={22}
          tintColor={colors['text-secondary']}
        />
      </Pressable>
      <Text className="text-[15px] font-semibold text-text-secondary">{title}</Text>
    </View>
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

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useNakathFormat } from '@/components/nakath/use-nakath-format';
import { Text } from '@/components/text';
import { getMaruDirection, getRahuKalaya } from '@/data/traditional';

function openTodayNakath() {
  router.navigate({ pathname: '/nakath', params: { view: 'today' } });
}

export function DayNakathCards({ date }: { date: Date }) {
  const { t } = useTranslation();
  const { formatRange, formatDirection } = useNakathFormat();
  const rahuKalaya = getRahuKalaya(date);
  const maruDirection = getMaruDirection(date.getDay());

  return (
    <View className="flex-row gap-3 px-5 pt-6">
      <NakathCard
        label={t('nakath.rahuKalaya')}
        value={
          rahuKalaya ? formatRange(rahuKalaya.start, rahuKalaya.end) : t('nakath.notAvailable')
        }
      />
      <NakathCard
        label={t('nakath.maruDirection')}
        value={maruDirection ? formatDirection(maruDirection) : t('nakath.notAvailable')}
      />
    </View>
  );
}

function NakathCard({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={t('day.openNakath')}
      onPress={openTodayNakath}
      className="flex-1 gap-1 rounded-card border border-border px-4 py-3.5 active:bg-surface"
    >
      <Text className="text-[13px] text-text-secondary">{label}</Text>
      <Text className="text-base font-bold text-text">{value}</Text>
    </Pressable>
  );
}

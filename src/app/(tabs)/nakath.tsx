import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { DataScope } from '@/components/data-scope';
import { AvuruduView } from '@/components/nakath/avurudu-view';
import { TodayView } from '@/components/nakath/today-view';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SegmentedControl } from '@/components/segmented-control';
import { Text } from '@/components/text';

type NakathView = 'avurudu' | 'today';

const nakathViews: NakathView[] = ['avurudu', 'today'];

function isNakathView(value: unknown): value is NakathView {
  return nakathViews.includes(value as NakathView);
}

export default function NakathScreen() {
  return (
    <DataScope>
      <NakathContent />
    </DataScope>
  );
}

function NakathContent() {
  const { t } = useTranslation();
  const { view } = useLocalSearchParams();
  const selectedView: NakathView = isNakathView(view) ? view : 'avurudu';

  return (
    <ScreenScrollView>
      <View className="gap-3.5 px-5 pb-3 pt-7">
        <Text className="text-[30px] font-bold tracking-[-0.6px] text-text">
          {t('tabs.nakath')}
        </Text>
        <SegmentedControl
          accessibilityLabel={t('nakath.view')}
          options={nakathViews.map((value) => ({ value, label: t(`nakath.${value}`) }))}
          selectedValue={selectedView}
          onSelect={(selected) => router.setParams({ view: selected })}
        />
      </View>
      <View className="gap-3 px-5 pt-1">
        {selectedView === 'avurudu' ? <AvuruduView /> : <TodayView />}
      </View>
    </ScreenScrollView>
  );
}

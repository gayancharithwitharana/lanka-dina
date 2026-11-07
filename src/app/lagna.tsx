import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { ScreenScrollView } from '@/components/screen-scroll-view';
import { Text } from '@/components/text';
import { lagnas, type Lagna } from '@/constants/lagnas';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useSettings } from '@/settings/settings-context';

function close() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace({ pathname: '/nakath', params: { view: 'today' } });
  }
}

export default function LagnaPickerScreen() {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { lagna: selectedLagna, updateSettings } = useSettings();

  function selectLagna(lagna: Lagna) {
    updateSettings({ lagna });
    close();
  }

  return (
    <ScreenScrollView>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-7">
        <Text className="text-[30px] font-bold tracking-[-0.6px] text-text">
          {t('lagnaPicker.title')}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={close}
          className="min-h-touch justify-center"
        >
          <Text className="text-[15px] font-semibold text-holiday">{t('lagnaPicker.close')}</Text>
        </Pressable>
      </View>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={t('lagnaPicker.title')}
        className="px-5"
      >
        {lagnas.map((lagna) => {
          const isSelected = lagna === selectedLagna;
          return (
            <Pressable
              key={lagna}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              onPress={() => selectLagna(lagna)}
              className="min-h-[52px] flex-row items-center justify-between border-b border-border active:bg-surface"
            >
              <Text className="text-[15px] text-text">{t(`lagnas.${lagna}`)}</Text>
              {isSelected && (
                <SymbolView
                  name={{ ios: 'checkmark', android: 'check' }}
                  size={18}
                  tintColor={colors.holiday}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </ScreenScrollView>
  );
}

import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, View } from 'react-native';

import { Text } from '@/components/text';
import type { DataSource } from '@/data/data-sources';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { parseIsoDate } from '@/utils/calendar';

export function DataSourceRow({ source }: { source: DataSource }) {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const updatedOn = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(
    parseIsoDate(source.retrievedAt),
  );
  const { url } = source;

  return (
    <Pressable
      disabled={!url}
      accessibilityRole={url ? 'link' : undefined}
      onPress={url ? () => Linking.openURL(url) : undefined}
      className="min-h-[52px] flex-row items-center gap-3 border-b border-border py-2 active:bg-surface"
    >
      <View className="flex-1 gap-0.5">
        <Text className="text-[15px] text-text">
          {t('settings.dataSource', { year: source.year, source: source.name })}
        </Text>
        <Text className="text-[13px] text-text-muted">
          {t('settings.updatedOn', { date: updatedOn })}
        </Text>
      </View>
      {url && (
        <SymbolView
          name={{ ios: 'arrow.up.right', android: 'open_in_new' }}
          size={16}
          tintColor={colors['text-muted']}
        />
      )}
    </Pressable>
  );
}

import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useNakathFormat } from '@/components/nakath/use-nakath-format';
import { Text } from '@/components/text';
import type { Nakath } from '@/data/nakath';
import { useThemeColors } from '@/hooks/use-theme-colors';

type NakathRowProps = {
  nakath: Nakath;
  hasReminder: boolean;
  onToggleReminder: () => void;
};

export function NakathRow({ nakath, hasReminder, onToggleReminder }: NakathRowProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const { formatDate, formatTime, describe } = useNakathFormat();
  const detail = describe(nakath);

  return (
    <View className="flex-row items-center gap-3.5 rounded-card border border-border py-3 pl-3.5 pr-3">
      <View className="w-[72px] gap-0.5">
        <Text className="text-xs font-semibold text-text-muted">{formatDate(nakath)}</Text>
        <Text className="text-sm font-bold text-text">{formatTime(nakath)}</Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-[15px] font-semibold text-text">{nakath.name}</Text>
        {detail !== '' && <Text className="text-[13px] text-text-secondary">{detail}</Text>}
      </View>
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={t('nakath.remindMe', { name: nakath.name })}
        accessibilityState={{ checked: hasReminder }}
        onPress={onToggleReminder}
        className={`h-11 w-11 items-center justify-center rounded-full ${hasReminder ? 'bg-poya' : 'bg-subtle'}`}
      >
        <SymbolView
          name={{ ios: hasReminder ? 'bell.fill' : 'bell', android: 'notifications' }}
          size={18}
          tintColor={hasReminder ? colors['on-poya'] : colors['text-muted']}
        />
      </Pressable>
    </View>
  );
}

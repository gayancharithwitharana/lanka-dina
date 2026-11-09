import { Switch, View } from 'react-native';

import { Text } from '@/components/text';
import { useThemeColors } from '@/hooks/use-theme-colors';

type AutomaticReminderRowProps = {
  title: string;
  detail: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
};

export function AutomaticReminderRow({
  title,
  detail,
  enabled,
  onToggle,
}: AutomaticReminderRowProps) {
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center gap-3.5 rounded-card border border-border p-3.5">
      <View className="flex-1 gap-0.5">
        <Text className="text-[15px] font-semibold text-text">{title}</Text>
        <Text className="text-[13px] text-text-secondary">{detail}</Text>
      </View>
      <Switch
        accessibilityLabel={title}
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ true: colors.holiday, false: colors.border }}
      />
    </View>
  );
}

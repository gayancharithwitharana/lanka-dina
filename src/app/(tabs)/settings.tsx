import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-background px-5 pt-7">
      <Text className="text-3xl font-bold text-text">{t('tabs.settings')}</Text>
    </SafeAreaView>
  );
}

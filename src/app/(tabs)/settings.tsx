import Constants from 'expo-constants';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SegmentedControl } from '@/components/segmented-control';
import colors from '@/constants/colors';
import { useSettings } from '@/settings/settings-context';
import type { Language } from '@/settings/settings-storage';
import { getWeekdayName, type WeekStart } from '@/utils/calendar';

const languageOptions: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'si', label: 'සිංහල' },
  { value: 'ta', label: 'தமிழ்' },
];

const weekStartValues: WeekStart[] = [0, 1];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { language, weekStartsOn, updateSettings } = useSettings();

  const weekStartOptions = weekStartValues.map((weekday) => ({
    value: weekday,
    label: getWeekdayName(weekday, i18n.language),
  }));

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-grow pb-4">
        <View className="w-full max-w-[600px] flex-1 self-center">
          <Text className="px-5 pb-3 pt-7 text-[30px] font-bold tracking-[-0.6px] text-text">
            {t('tabs.settings')}
          </Text>

          <SettingsSection title={t('settings.language')}>
            <SegmentedControl
              accessibilityLabel={t('settings.language')}
              options={languageOptions}
              selectedValue={language}
              onSelect={(selectedLanguage) => updateSettings({ language: selectedLanguage })}
            />
          </SettingsSection>

          <SettingsSection title={t('settings.weekStartsOn')}>
            <SegmentedControl
              accessibilityLabel={t('settings.weekStartsOn')}
              options={weekStartOptions}
              selectedValue={weekStartsOn}
              onSelect={(selectedWeekStart) => updateSettings({ weekStartsOn: selectedWeekStart })}
            />
          </SettingsSection>

          <SettingsSection title={t('settings.app')}>
            <View>
              <SettingsRow
                label={t('settings.notifications')}
                onPress={() => router.navigate('/reminders')}
              />
              <SettingsRow label={t('settings.removeAds')} value={t('settings.comingSoon')} />
              <SettingsRow label={t('settings.holidayData')} value={t('settings.sampleData')} />
            </View>
          </SettingsSection>

          <View className="flex-1" />
          <Text className="pt-6 text-center text-xs text-text-muted">
            {t('settings.version', { version: Constants.expoConfig?.version })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2.5 px-5 pt-5">
      <Text className="mt-2 text-label uppercase text-text-muted">{title}</Text>
      {children}
    </View>
  );
}

type SettingsRowProps = {
  label: string;
  value?: string;
  onPress?: () => void;
};

function SettingsRow({ label, value, onPress }: SettingsRowProps) {
  return (
    <Pressable
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      className="min-h-[52px] flex-row items-center justify-between border-b border-border active:bg-surface"
    >
      <Text className="text-[15px] text-text">{label}</Text>
      {value && <Text className="text-[13px] text-text-muted">{value}</Text>}
      {onPress && (
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right' }}
          size={18}
          tintColor={colors.text.muted}
        />
      )}
    </Pressable>
  );
}

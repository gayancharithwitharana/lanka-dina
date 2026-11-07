import { NativeTabs } from 'expo-router/native-tabs';
import { useTranslation } from 'react-i18next';

import { getLanguageFont } from '@/fonts';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function AppTabs() {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const { fontFamily } = getLanguageFont(i18n.language);

  return (
    <NativeTabs
      backgroundColor={colors.background}
      tintColor={colors.holiday}
      iconColor={{ default: colors['text-secondary'], selected: colors.holiday }}
      labelStyle={{
        default: { fontFamily, color: colors['text-secondary'] },
        selected: { fontFamily, color: colors.holiday },
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tabs.calendar')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="upcoming">
        <NativeTabs.Trigger.Label>{t('tabs.upcoming')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="list.bullet" md="list" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="reminders">
        <NativeTabs.Trigger.Label>{t('tabs.reminders')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bell" md="notifications" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>{t('tabs.settings')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="slider.horizontal.3" md="tune" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

import { NativeTabs } from 'expo-router/native-tabs';

import colors from '@/constants/colors';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={colors.background}
      tintColor={colors.holiday}
      iconColor={{ default: colors.text.secondary, selected: colors.holiday }}
      labelStyle={{
        default: { color: colors.text.secondary },
        selected: { color: colors.holiday },
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Calendar</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="upcoming">
        <NativeTabs.Trigger.Label>Upcoming</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="list.bullet" md="list" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="reminders">
        <NativeTabs.Trigger.Label>Reminders</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bell" md="notifications" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="slider.horizontal.3" md="tune" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

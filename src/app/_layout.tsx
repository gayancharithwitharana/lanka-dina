import '@/global.css';
import '@/i18n';

import { colorScheme } from 'nativewind';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme-colors';
import { SettingsProvider } from '@/settings/settings-context';
import { loadSettings } from '@/settings/settings-storage';

colorScheme.set(loadSettings().appearance);

export default function RootLayout() {
  return (
    <SettingsProvider>
      <ThemedNavigation />
    </SettingsProvider>
  );
}

function ThemedNavigation() {
  const isDark = useColorScheme() === 'dark';
  const colors = useThemeColors();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme: Theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.holiday,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="day/[date]" />
      </Stack>
    </ThemeProvider>
  );
}

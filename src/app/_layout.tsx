import '@/global.css';
import '@/i18n';

import { colorScheme } from 'nativewind';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { prepareDatabase } from '@/db/prepare-database';
import { fontFamilyDefinitions } from '@/fonts';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { SettingsProvider } from '@/settings/settings-context';
import { loadSettings } from '@/settings/settings-storage';

colorScheme.set(loadSettings().appearance);
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontFamilyDefinitions);
  const fontsSettled = fontsLoaded || fontError !== null;
  const databaseReady = useDatabase();
  const appReady = fontsSettled && databaseReady;

  useEffect(() => {
    if (appReady) SplashScreen.hideAsync();
  }, [appReady]);

  if (!appReady) return null;

  return (
    <SettingsProvider>
      <ThemedNavigation />
    </SettingsProvider>
  );
}

function useDatabase(): boolean {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    prepareDatabase().then(() => setReady(true), setError);
  }, []);

  if (error) throw error;
  return ready;
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
        <Stack.Screen name="lagna" options={{ presentation: 'modal' }} />
        <Stack.Screen name="note/[date]" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

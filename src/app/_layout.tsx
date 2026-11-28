import '@/global.css';
import '@/i18n';

import { colorScheme } from 'nativewind';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';
import { AppState, useColorScheme } from 'react-native';

import { prepareAds } from '@/ads/ads';
import { notifyDataUpdated } from '@/data/data-updates';
import { updateRemoteData } from '@/data/remote-data';
import { prepareDatabase } from '@/db/prepare-database';
import { fontFamilyDefinitions } from '@/fonts';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { configureNotifications, syncNotifications } from '@/notifications/sync-notifications';
import { useNotificationNavigation } from '@/notifications/use-notification-navigation';
import { SettingsProvider } from '@/settings/settings-context';
import { loadSettings } from '@/settings/settings-storage';

colorScheme.set(loadSettings().appearance);
SplashScreen.preventAutoHideAsync();
configureNotifications();

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
    prepareDatabase().then(() => {
      setReady(true);
      syncNotifications();
      refreshRemoteData();
      prepareAds().catch(() => {});
    }, setError);
  }, []);

  if (error) throw error;
  return ready;
}

function refreshRemoteData() {
  updateRemoteData().then(
    (changed) => {
      if (!changed) return;
      notifyDataUpdated();
      syncNotifications();
    },
    () => {},
  );
}

function ThemedNavigation() {
  const isDark = useColorScheme() === 'dark';
  const colors = useThemeColors();
  useNotificationNavigation();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      syncNotifications();
      refreshRemoteData();
    });
    return () => subscription.remove();
  }, []);

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
        <Stack.Screen name="nakath-share" options={{ presentation: 'modal' }} />
        <Stack.Screen name="note/[date]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="reminder/[date]" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

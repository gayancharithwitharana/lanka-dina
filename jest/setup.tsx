jest.mock('expo-sqlite/kv-store', () => {
  const storedValues = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItemSync: (key: string) => storedValues.get(key) ?? null,
      setItemSync: (key: string, value: string) => storedValues.set(key, value),
      clear: () => storedValues.clear(),
    },
  };
});

jest.mock('react-native-google-mobile-ads', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: () => ({ initialize: jest.fn(async () => []) }),
    AdsConsent: {
      gatherConsent: jest.fn(async () => ({ canRequestAds: true })),
      getConsentInfo: jest.fn(async () => ({ canRequestAds: true })),
      showPrivacyOptionsForm: jest.fn(async () => ({ canRequestAds: true })),
    },
    AdsConsentPrivacyOptionsRequirementStatus: {
      REQUIRED: 'REQUIRED',
      NOT_REQUIRED: 'NOT_REQUIRED',
    },
    BannerAd: jest.fn(({ unitId }: { unitId: string }) => <Text>{`Test ad ${unitId}`}</Text>),
    BannerAdSize: { BANNER: 'BANNER' },
    TestIds: { BANNER: 'test-banner' },
    useForeground: jest.fn(),
  };
});

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(async () => 'file:///tmp/nakath.png'),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en', languageTag: 'en-US' }]),
}));

jest.mock('@/db/client', () => {
  const Database = require('better-sqlite3');
  const { drizzle } = require('drizzle-orm/better-sqlite3');
  const schema = require('@/db/schema');
  return { db: drizzle(new Database(':memory:'), { schema }) };
});

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
  scheduleNotificationAsync: jest.fn(async () => 'scheduled'),
  setNotificationChannelAsync: jest.fn(async () => null),
  useLastNotificationResponse: jest.fn(() => undefined),
  clearLastNotificationResponseAsync: jest.fn(async () => undefined),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidImportance: { DEFAULT: 3 },
}));

jest.mock('@expo/ui/community/datetime-picker', () => {
  const { Text } = require('react-native');
  return {
    __esModule: true,
    DateTimePicker: ({ value, mode }: { value: Date; mode: string }) => (
      <Text>{`${mode}: ${value.toISOString()}`}</Text>
    ),
  };
});

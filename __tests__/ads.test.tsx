import { Slot } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';
import { act } from '@testing-library/react-native';
import { useEffect } from 'react';
import { AdsConsent, BannerAd } from 'react-native-google-mobile-ads';

import { prepareAds, resetAdsForTests } from '@/ads/ads';

const APP_DIRECTORY = {
  appDir: 'src/app',
  overrides: { '(tabs)/_layout': () => <Slot /> },
};

const banner = () => screen.queryByLabelText('Advertisement');

async function renderWithAds(initialUrl: string) {
  await renderRouter(APP_DIRECTORY, { initialUrl });
  await act(async () => {
    await prepareAds();
  });
}

beforeEach(() => {
  resetAdsForTests();
  jest.useFakeTimers({ now: new Date(2026, 10, 7, 9, 0), doNotFake: ['nextTick', 'setImmediate'] });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('ad banner', () => {
  it.each(['/', '/upcoming', '/nakath'])('shows a test banner on %s', async (url) => {
    await renderWithAds(url);

    expect(banner()).toBeOnTheScreen();
    expect(screen.getByText('Test ad test-banner')).toBeOnTheScreen();
  });

  it.each(['/settings', '/reminders', '/day/2026-11-24', '/nakath-share'])(
    'shows no banner on %s',
    async (url) => {
      await renderWithAds(url);

      expect(banner()).not.toBeOnTheScreen();
    },
  );

  it('shows no banner when consent does not allow ad requests', async () => {
    jest.mocked(AdsConsent.gatherConsent).mockResolvedValueOnce({ canRequestAds: false } as never);

    await renderWithAds('/');

    expect(banner()).not.toBeOnTheScreen();
  });

  it('still shows ads with the earlier consent when gathering consent fails', async () => {
    jest.mocked(AdsConsent.gatherConsent).mockRejectedValueOnce(new Error('offline'));

    await renderWithAds('/');

    expect(banner()).toBeOnTheScreen();
  });

  it('hides the banner space when the ad fails to load', async () => {
    const FailingBanner = ({ onAdFailedToLoad }: { onAdFailedToLoad: (error: Error) => void }) => {
      useEffect(() => onAdFailedToLoad(new Error('no fill')), [onAdFailedToLoad]);
      return null;
    };
    jest.mocked(BannerAd as unknown as jest.Mock).mockImplementation(FailingBanner);

    await renderWithAds('/');

    expect(banner()).not.toBeOnTheScreen();
    jest.mocked(BannerAd as unknown as jest.Mock).mockReset();
  });
});

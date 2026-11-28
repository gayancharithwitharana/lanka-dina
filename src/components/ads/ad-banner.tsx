import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';
import { BannerAd, BannerAdSize, useForeground } from 'react-native-google-mobile-ads';

import { BANNER_AD_UNIT_ID } from '@/ads/ad-units';
import { useAdsReady } from '@/ads/ads';

export function AdBanner() {
  const { t } = useTranslation();
  const adsReady = useAdsReady();
  const bannerRef = useRef<BannerAd>(null);
  const [failed, setFailed] = useState(false);

  // iOS can stop a banner's web view while the app is suspended, leaving it blank.
  useForeground(() => {
    if (Platform.OS === 'ios') bannerRef.current?.load();
  });

  if (!adsReady || failed) return null;

  return (
    <View
      accessibilityLabel={t('ads.advertisement')}
      className="min-h-[66px] items-center justify-center border-t border-border bg-surface py-2"
    >
      <BannerAd
        ref={bannerRef}
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.BANNER}
        onAdLoaded={() => setFailed(false)}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

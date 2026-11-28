import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useRef, type ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Share, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { DataScope } from '@/components/data-scope';
import { NakathShareCard } from '@/components/nakath/nakath-share-card';
import { useNakathFormat } from '@/components/nakath/use-nakath-format';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { Text } from '@/components/text';
import { getLatestAvurudu, type AvuruduNakath } from '@/data/nakath';

function close() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace({ pathname: '/nakath', params: { view: 'avurudu' } });
  }
}

export default function NakathShareScreen() {
  return (
    <DataScope>
      <NakathShareContent />
    </DataScope>
  );
}

function NakathShareContent() {
  const { t, i18n } = useTranslation();
  const avurudu = getLatestAvurudu(i18n.language);

  return (
    <ScreenScrollView>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-7">
        <Text className="text-[30px] font-bold tracking-[-0.6px] text-text">
          {t('nakath.shareTitle')}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={close}
          className="min-h-touch justify-center"
        >
          <Text className="text-[15px] font-semibold text-holiday">{t('nakath.close')}</Text>
        </Pressable>
      </View>
      {avurudu ? (
        <SharePreview avurudu={avurudu} />
      ) : (
        <Text className="px-5 text-[15px] text-text-secondary">{t('nakath.noAvurudu')}</Text>
      )}
    </ScreenScrollView>
  );
}

function SharePreview({ avurudu }: { avurudu: AvuruduNakath }) {
  const { t } = useTranslation();
  const cardRef = useRef<ComponentRef<typeof View>>(null);
  const { formatDate, formatTime, describe } = useNakathFormat();
  const title = t('nakath.newYearTitle', { year: avurudu.year });

  function shareText() {
    const lines = avurudu.items.map((nakath) =>
      [`${formatDate(nakath)} ${formatTime(nakath)}`, nakath.name, describe(nakath)]
        .filter(Boolean)
        .join(' · '),
    );
    Share.share({ message: [title, ...lines, avurudu.source?.name].filter(Boolean).join('\n') });
  }

  async function shareImage() {
    if (!(await Sharing.isAvailableAsync())) {
      shareText();
      return;
    }
    const uri = await captureRef(cardRef, { format: 'png', result: 'tmpfile' });
    await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: title });
  }

  return (
    <View className="gap-3 px-5 pb-8">
      <NakathShareCard ref={cardRef} avurudu={avurudu} />
      <Pressable
        accessibilityRole="button"
        onPress={shareImage}
        className="min-h-touch items-center justify-center rounded-button bg-inverse px-4 active:opacity-80"
      >
        <Text className="text-[15px] font-semibold text-on-inverse">{t('nakath.shareImage')}</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={shareText}
        className="min-h-touch items-center justify-center rounded-button border border-border px-4 active:bg-surface"
      >
        <Text className="text-[15px] font-semibold text-text">{t('nakath.shareText')}</Text>
      </Pressable>
    </View>
  );
}

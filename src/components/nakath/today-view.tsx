import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useNakathFormat } from '@/components/nakath/use-nakath-format';
import { Text } from '@/components/text';
import { getAyaWaya, getLatestAvuruduYear } from '@/data/nakath';
import {
  getCalculationPlace,
  getKalaHorawa,
  getMaruDirection,
  getRahuKalaya,
} from '@/data/traditional';
import { useNow } from '@/hooks/use-now';
import { useSettings } from '@/settings/settings-context';
import { getWeekdayName } from '@/utils/calendar';
import { isWithinRange } from '@/utils/nakath-time';

export function TodayView() {
  const { t, i18n } = useTranslation();
  const now = useNow();
  const { formatRange, formatDirection } = useNakathFormat();
  const weekday = now.getDay();
  const rahuKalaya = getRahuKalaya(now);
  const maruDirection = getMaruDirection(weekday);
  const kalaHorawa = getKalaHorawa(now);
  const place = getCalculationPlace(i18n.language);
  const isRahuKalayaNow =
    rahuKalaya !== null && isWithinRange(now, rahuKalaya.start, rahuKalaya.end);

  return (
    <>
      <Card>
        <View className="flex-row items-center justify-between">
          <Text className="text-label uppercase text-text-muted">
            {t('nakath.rahuKalayaOn', { weekday: getWeekdayName(weekday, i18n.language) })}
          </Text>
          <View className={`rounded-pill px-2.5 py-1 ${isRahuKalayaNow ? 'bg-poya' : 'bg-subtle'}`}>
            <Text
              className={`text-xs font-semibold ${isRahuKalayaNow ? 'text-on-poya' : 'text-text-secondary'}`}
            >
              {isRahuKalayaNow ? t('nakath.now') : t('nakath.notNow')}
            </Text>
          </View>
        </View>
        <Text className="text-[26px] font-bold tracking-[-0.3px] text-text">
          {rahuKalaya ? formatRange(rahuKalaya.start, rahuKalaya.end) : t('nakath.notAvailable')}
        </Text>
        <Text className="text-[13px] text-text-secondary">{t('nakath.rahuKalayaAdvice')}</Text>
        {place && (
          <Text className="text-xs text-text-muted">{t('nakath.calculatedFrom', { place })}</Text>
        )}
      </Card>

      <View className="flex-row gap-3">
        <SmallCard
          label={t('nakath.maruDirection')}
          value={maruDirection ? formatDirection(maruDirection) : t('nakath.notAvailable')}
        />
        <SmallCard
          label={t('nakath.kalaHorawaNow')}
          value={kalaHorawa ? t(`planets.${kalaHorawa}`) : t('nakath.notAvailable')}
        />
      </View>

      <AyaWayaCard />
    </>
  );
}

function AyaWayaCard() {
  const { t } = useTranslation();
  const { lagna } = useSettings();
  const year = getLatestAvuruduYear();
  const ayaWaya = lagna && year !== null ? getAyaWaya(year, lagna) : null;

  return (
    <Card>
      <Text className="text-label uppercase text-text-muted">{t('nakath.yourYear')}</Text>
      {lagna ? (
        <>
          <Text className="text-[15px] font-semibold text-text">
            {t('nakath.lagnaYear', { lagna: t(`lagnas.${lagna}`), year })}
          </Text>
          {ayaWaya ? (
            <View className="flex-row gap-3">
              <Figure label={t('nakath.aya')} value={ayaWaya.aya} />
              <Figure label={t('nakath.waya')} value={ayaWaya.waya} />
            </View>
          ) : (
            <Text className="text-[15px] text-text-secondary">{t('nakath.noAyaWaya')}</Text>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/lagna')}
            className="min-h-touch justify-center self-start"
          >
            <Text className="text-[15px] font-semibold text-holiday">
              {t('nakath.changeLagna')}
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text className="text-[15px] leading-6 text-text-secondary">
            {t('nakath.setLagnaPrompt')}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/lagna')}
            className="h-11 justify-center self-start rounded-button bg-inverse px-[18px] active:opacity-80"
          >
            <Text className="text-[15px] font-semibold text-on-inverse">
              {t('nakath.setLagna')}
            </Text>
          </Pressable>
        </>
      )}
    </Card>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <View className="gap-2 rounded-card border border-border p-[18px]">{children}</View>;
}

function SmallCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-1.5 rounded-card border border-border p-4">
      <Text className="text-[13px] text-text-secondary">{label}</Text>
      <Text className="text-lg font-bold text-text">{value}</Text>
    </View>
  );
}

function Figure({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 gap-1">
      <Text className="text-[13px] text-text-secondary">{label}</Text>
      <Text className="text-[26px] font-bold text-text">{value}</Text>
    </View>
  );
}

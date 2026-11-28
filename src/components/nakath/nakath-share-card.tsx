import type { ComponentRef, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useNakathFormat } from '@/components/nakath/use-nakath-format';
import { Text } from '@/components/text';
import { getCountdownNakath, type AvuruduNakath } from '@/data/nakath';
import { useToday } from '@/hooks/use-today';

type NakathShareCardProps = { avurudu: AvuruduNakath; ref?: Ref<ComponentRef<typeof View>> };

export function NakathShareCard({ avurudu, ref }: NakathShareCardProps) {
  const { t } = useTranslation();
  const today = useToday();
  const { formatDate, formatTime, describe } = useNakathFormat();
  const highlight = getCountdownNakath(avurudu, today);

  return (
    <View ref={ref} collapsable={false} className="bg-background">
      <View className="gap-4 rounded-card border border-poya-border bg-background p-5">
        <View className="gap-1 rounded-card bg-poya-tint p-4">
          <Text className="text-[13px] font-semibold text-poya">
            {t('nakath.newYearTitle', { year: avurudu.year })}
          </Text>
          {highlight && (
            <>
              <Text className="text-[17px] font-bold text-text">{highlight.name}</Text>
              <Text className="text-[15px] text-text-secondary">
                {`${formatDate(highlight)} · ${formatTime(highlight)}`}
              </Text>
            </>
          )}
        </View>

        <View>
          {avurudu.items.map((nakath, index) => {
            const detail = describe(nakath);
            return (
              <View
                key={nakath.id}
                className={`flex-row gap-3.5 py-2.5 ${index > 0 ? 'border-t border-border' : ''}`}
              >
                <View className="w-[72px] gap-0.5">
                  <Text className="text-xs font-semibold text-text-muted">
                    {formatDate(nakath)}
                  </Text>
                  <Text className="text-sm font-bold text-text">{formatTime(nakath)}</Text>
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-[15px] font-semibold text-text">{nakath.name}</Text>
                  {detail !== '' && (
                    <Text className="text-[13px] text-text-secondary">{detail}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View className="gap-1">
          {avurudu.source && <Text className="text-xs text-text-muted">{avurudu.source.name}</Text>}
          <Text className="text-xs font-semibold text-poya">{t('nakath.sharedFrom')}</Text>
        </View>
      </View>
    </View>
  );
}

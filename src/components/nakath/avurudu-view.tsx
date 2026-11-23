import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Share, View } from 'react-native';

import { NakathRow } from '@/components/nakath/nakath-row';
import { useNakathFormat } from '@/components/nakath/use-nakath-format';
import { Text } from '@/components/text';
import {
  getCountdownNakath,
  getLatestAvurudu,
  getNakathReminderIds,
  setNakathReminder,
  type AvuruduNakath,
  type Nakath,
} from '@/data/nakath';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { useToday } from '@/hooks/use-today';
import { getDaysUntil } from '@/utils/nakath-time';

export function AvuruduView() {
  const { t, i18n } = useTranslation();
  const avurudu = getLatestAvurudu(i18n.language);
  const [reminderIds, setReminderIds] = useState(getNakathReminderIds);

  if (!avurudu) {
    return <Text className="text-[15px] text-text-secondary">{t('nakath.noAvurudu')}</Text>;
  }

  function toggleReminder(nakath: Nakath) {
    setNakathReminder(nakath, !reminderIds.has(nakath.id));
    setReminderIds(getNakathReminderIds());
  }

  return (
    <>
      <CountdownCard avurudu={avurudu} />
      {avurudu.items.map((nakath) => (
        <NakathRow
          key={nakath.id}
          nakath={nakath}
          hasReminder={reminderIds.has(nakath.id)}
          onToggleReminder={() => toggleReminder(nakath)}
        />
      ))}
    </>
  );
}

function CountdownCard({ avurudu }: { avurudu: AvuruduNakath }) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const today = useToday();
  const { formatDate, formatTime, describe } = useNakathFormat();
  const countdown = getCountdownNakath(avurudu, today);
  const daysUntil = countdown ? Math.max(0, getDaysUntil(today, countdown.startsAt)) : null;
  const title = t('nakath.newYearTitle', { year: avurudu.year });
  const { source } = avurudu;

  function shareNakath() {
    const lines = avurudu.items.map((nakath) =>
      [`${formatDate(nakath)} ${formatTime(nakath)}`, nakath.name, describe(nakath)]
        .filter(Boolean)
        .join(' · '),
    );
    Share.share({ message: [title, ...lines, source?.name].filter(Boolean).join('\n') });
  }

  return (
    <View className="gap-1.5 rounded-card border border-poya-border bg-poya-tint p-[18px]">
      <Text className="text-[13px] font-semibold text-poya">{title}</Text>
      {countdown && daysUntil !== null && (
        <>
          <Text className="text-[15px] text-text-secondary">
            {t('nakath.countdownTo', { name: countdown.name })}
          </Text>
          <View className="flex-row items-end justify-between">
            <Text className="text-[34px] font-bold tracking-[-0.7px] text-text">
              {daysUntil === 0 ? t('nakath.dawnToday') : t('nakath.days', { count: daysUntil })}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={shareNakath}
              className="h-11 flex-row items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 active:bg-subtle"
            >
              <SymbolView
                name={{ ios: 'square.and.arrow.up', android: 'share' }}
                size={16}
                tintColor={colors.text}
              />
              <Text className="text-sm font-semibold text-text">{t('nakath.share')}</Text>
            </Pressable>
          </View>
        </>
      )}
      {source && <SourceLine name={source.name} url={source.url} />}
    </View>
  );
}

function SourceLine({ name, url }: { name: string; url?: string }) {
  if (!url) return <Text className="text-xs text-text-muted">{name}</Text>;
  return (
    <Pressable accessibilityRole="link" onPress={() => Linking.openURL(url)} hitSlop={12}>
      <Text className="text-xs text-text-muted underline">{name}</Text>
    </Pressable>
  );
}

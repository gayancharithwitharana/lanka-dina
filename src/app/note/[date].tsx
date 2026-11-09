import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { ScreenScrollView } from '@/components/screen-scroll-view';
import { Text } from '@/components/text';
import { getNote, saveNote } from '@/data/notes';
import { getLanguageFont } from '@/fonts';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { isValidIsoDate, parseIsoDate } from '@/utils/calendar';

function close(isoDate: string) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace({ pathname: '/day/[date]', params: { date: isoDate } });
  }
}

export default function NoteEditorScreen() {
  const { date } = useLocalSearchParams();
  const { t } = useTranslation();

  if (!isValidIsoDate(date)) {
    return (
      <ScreenScrollView>
        <Text className="px-6 pt-7 text-[15px] text-text-secondary">{t('day.invalidDate')}</Text>
      </ScreenScrollView>
    );
  }

  return <NoteEditor isoDate={date} />;
}

function NoteEditor({ isoDate }: { isoDate: string }) {
  const { t, i18n } = useTranslation();
  const colors = useThemeColors();
  const [text, setText] = useState(() => getNote(isoDate) ?? '');
  const formattedDate = new Intl.DateTimeFormat(i18n.language, {
    month: 'long',
    day: 'numeric',
  }).format(parseIsoDate(isoDate));

  function save() {
    saveNote(isoDate, text);
    close(isoDate);
  }

  return (
    <ScreenScrollView>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-7">
        <Pressable
          accessibilityRole="button"
          onPress={() => close(isoDate)}
          className="min-h-touch justify-center"
        >
          <Text className="text-[15px] text-text-secondary">{t('noteEditor.cancel')}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={save} className="min-h-touch justify-center">
          <Text className="text-[15px] font-semibold text-holiday">{t('noteEditor.save')}</Text>
        </Pressable>
      </View>
      <Text className="px-5 pb-3 text-[26px] font-bold tracking-[-0.3px] text-text">
        {t('noteEditor.title', { date: formattedDate })}
      </Text>
      <TextInput
        accessibilityLabel={t('noteEditor.label')}
        autoFocus
        multiline
        value={text}
        onChangeText={setText}
        placeholder={t('noteEditor.placeholder')}
        placeholderTextColor={colors['text-muted']}
        textAlignVertical="top"
        className={`mx-5 min-h-[160px] rounded-card border border-border p-4 text-[15px] leading-6 text-text ${getLanguageFont(i18n.language).className}`}
      />
    </ScreenScrollView>
  );
}

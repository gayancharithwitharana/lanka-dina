import { useTranslation } from 'react-i18next';

import { ScreenScrollView } from '@/components/screen-scroll-view';
import { Text } from '@/components/text';

export default function RemindersScreen() {
  const { t } = useTranslation();

  return (
    <ScreenScrollView>
      <Text className="px-5 pt-7 text-3xl font-bold text-text">{t('tabs.reminders')}</Text>
    </ScreenScrollView>
  );
}

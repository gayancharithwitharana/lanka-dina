import { useTranslation } from 'react-i18next';

import type en from '@/locales/en.json';
import type { Nakath } from '@/data/nakath';
import { formatClockTime, splitDateTime } from '@/utils/nakath-time';

type Direction = keyof typeof en.directions;
type NakathColor = keyof typeof en.nakathColors;

export function useNakathFormat() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  function formatDate(nakath: Nakath): string {
    const { date } = splitDateTime(nakath.startsAt);
    return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date);
  }

  function formatTime(nakath: Nakath): string {
    const { clockTime } = splitDateTime(nakath.startsAt);
    return clockTime ? formatClockTime(clockTime, locale) : t('nakath.allDay');
  }

  function describe(nakath: Nakath): string {
    const endTime = nakath.endsAt && splitDateTime(nakath.endsAt).clockTime;
    return [
      endTime && t('nakath.until', { time: formatClockTime(endTime, locale) }),
      nakath.direction &&
        t('nakath.face', { direction: t(`directions.${nakath.direction as Direction}`) }),
      nakath.color && t('nakath.wear', { color: t(`nakathColors.${nakath.color as NakathColor}`) }),
      nakath.notes,
    ]
      .filter(Boolean)
      .join(' · ');
  }

  function formatRange(start: string, end: string): string {
    return t('nakath.timeRange', {
      start: formatClockTime(start, locale),
      end: formatClockTime(end, locale),
    });
  }

  function formatDirection(direction: string): string {
    const label = t(`directions.${direction as Direction}`);
    return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1);
  }

  return { formatDate, formatTime, describe, formatRange, formatDirection };
}

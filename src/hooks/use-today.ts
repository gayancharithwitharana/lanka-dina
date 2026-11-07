import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { toIsoDate } from '@/utils/calendar';

export function useToday(): Date {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    function refreshIfDayChanged() {
      setToday((current) => {
        const now = new Date();
        return toIsoDate(now) === toIsoDate(current) ? current : now;
      });
    }

    const nextMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const midnightTimer = setTimeout(refreshIfDayChanged, nextMidnight.getTime() - Date.now());
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshIfDayChanged();
    });

    return () => {
      clearTimeout(midnightTimer);
      appStateSubscription.remove();
    };
  }, [today]);

  return today;
}

import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

export function useNotificationNavigation(): void {
  const response = Notifications.useLastNotificationResponse();

  useEffect(() => {
    const url = response?.notification.request.content.data?.url;
    if (typeof url !== 'string') return;
    router.push(url as Parameters<typeof router.push>[0]);
    Notifications.clearLastNotificationResponseAsync();
  }, [response]);
}

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function schedulePeriodReminder(daysInAdvance: number = 2): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Gentle Care Reminder 🌸',
        body: `Your period is estimated in ${daysInAdvance} days. Remember to stay cozy, hydrated, and rest well! 💗`,
        sound: true,
        data: { type: 'period_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 86400 * daysInAdvance,
      },
    });
    return identifier;
  } catch (err) {
    console.warn('Failed to schedule period reminder:', err);
    return null;
  }
}

export async function scheduleHydrationReminder(): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Sip Some Water, Princess! 💧',
        body: 'A little reminder to hydrate your radiant self today with a fresh glass of water! ✨',
        sound: true,
        data: { type: 'hydration' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3600 * 3, // Every 3 hours
        repeats: true,
      },
    });
    return identifier;
  } catch (err) {
    console.warn('Failed to schedule hydration reminder:', err);
    return null;
  }
}

export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

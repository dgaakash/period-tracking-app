import AsyncStorage from 'expo-sqlite';
import { getDatabase } from '../db/sqlite';
import * as Haptics from 'expo-haptics';

export const GREETINGS_LIST: string[] = [
  "Welcome back, Cutie Pie! 💗",
  "Welcome back, Princess! 👑",
  "Welcome back, Bhondu! 🎀",
  "Welcome back, Pyaari! 🧸",
  "Hey Beautiful! Missed you! 💕",
  "Hello, My Favourite Girl! 🌷",
  "Welcome back, Sunshine! ☀️",
  "Look who's back! My Pretty Girl! 💗",
  "Hey Sweetheart! 🦋",
  "You're looking lovely today, Princess! ✨",
  "Welcome back, Meri Jaan! ❤️",
  "Hiiiii, Pretty! 🎀",
  "Your little pink world missed you! 💝",
  "Hey, Cutie! Ready for today? 🌸",
  "Sending you the biggest virtual hug, my love! 🧸",
  "The world is brighter whenever you open this app! ☀️",
  "You are cherished, loved, and adored! 💖",
  "My beautiful girl is back! 🌷",
  "Take a deep breath, Princess. You've got this! 🌸",
  "Hello gorgeous! Hope your day is as sweet as you! 🍭",
  "A little reminder that you mean the whole world to me! 💗",
  "Hugs, cuddles, and warm thoughts for you today! 🧸",
  "Hey Angel! Treat yourself gently today! 🕊️",
  "Look at you, being amazing as always! ✨",
  "Your smile is my absolute favourite thing! 🎀",
  "No matter how you feel today, I love you endlessly! ❤️",
  "Rest well, hydrate, and know you're so special! 💧",
  "Welcome back to your safe pink sanctuary, darling! 🏰",
  "Sending you a bundle of pink roses and kisses! 🌹",
  "You deserve all the sweetness and comfort today, Cutie! 🧁",
  "Thinking of you always, my sweetest dream! 🌙",
  "My favourite princess has arrived! 👑💖",
  "Remember to be kind to your precious body today! 🌸",
  "Hugs and kisses heading your way right now! 💕"
];

let lastGreetingIndex: number = -1;

export function getRandomGreeting(lastIndex: number = lastGreetingIndex): { greeting: string; index: number } {
  let newIndex: number;
  do {
    newIndex = Math.floor(Math.random() * GREETINGS_LIST.length);
  } while (newIndex === lastIndex && GREETINGS_LIST.length > 1);

  lastGreetingIndex = newIndex;
  return { greeting: GREETINGS_LIST[newIndex], index: newIndex };
}

export async function checkWelcomeStatus(): Promise<{
  showModal: boolean;
  message: string;
  isFirstLaunch: boolean;
}> {
  try {
    const db = await getDatabase();
    const prefs = await db.getFirstAsync<{
      greeting_enabled: number;
      has_seen_first_welcome: number;
    }>('SELECT greeting_enabled, has_seen_first_welcome FROM user_preferences LIMIT 1');

    if (!prefs || prefs.greeting_enabled === 0) {
      return { showModal: false, message: '', isFirstLaunch: false };
    }

    if (prefs.has_seen_first_welcome === 0) {
      // Mark as seen
      await db.runAsync('UPDATE user_preferences SET has_seen_first_welcome = 1');
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      return {
        showModal: true,
        message: 'Welcome Princess! 💗',
        isFirstLaunch: true,
      };
    }

    // Subsequent launch
    const { greeting } = getRandomGreeting();
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    return {
      showModal: true,
      message: greeting,
      isFirstLaunch: false,
    };
  } catch (err) {
    // Fallback
    const { greeting } = getRandomGreeting();
    return {
      showModal: true,
      message: greeting,
      isFirstLaunch: false,
    };
  }
}

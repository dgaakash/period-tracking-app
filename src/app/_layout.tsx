import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useAppTheme } from '../context/ThemeContext';
import { WelcomeModal } from '../components/common/WelcomeModal';
import { getDatabase } from '../db/sqlite';

// Keep splash screen visible while loading resources
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigation() {
  const { themeName } = useAppTheme();

  return (
    <>
      <StatusBar style={themeName === 'midnight_pink' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="features/boyfriend-dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="features/love-messages" options={{ headerShown: false }} />
        <Stack.Screen name="features/comfort-checklist" options={{ headerShown: false }} />
        <Stack.Screen name="features/emotional-checkin" options={{ headerShown: false }} />
        <Stack.Screen name="features/memories-scrapbook" options={{ headerShown: false }} />
        <Stack.Screen name="features/princess-care" options={{ headerShown: false }} />
        <Stack.Screen name="features/education" options={{ headerShown: false }} />
        <Stack.Screen name="features/article/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="features/partner-sharing" options={{ headerShown: false }} />
        <Stack.Screen name="features/wearables" options={{ headerShown: false }} />
        <Stack.Screen name="features/cycle-history" options={{ headerShown: false }} />
        <Stack.Screen name="features/theme-customization" options={{ headerShown: false }} />
        <Stack.Screen name="features/security" options={{ headerShown: false }} />
      </Stack>
      <WelcomeModal />
    </>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await getDatabase();
      } catch (e) {
        console.warn('DB initialization error:', e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }
    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigation />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

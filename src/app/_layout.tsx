import React, { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useAppTheme } from '../context/ThemeContext';
import { WelcomeModal } from '../components/common/WelcomeModal';
import { DreamlandLoadingScreen } from '../components/common/DreamlandLoadingScreen';
import { getDatabase } from '../db/sqlite';

// Keep native splash screen visible until our React Native tree mounts
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
  const [isDbReady, setIsDbReady] = useState(false);
  const [isOverlayGone, setIsOverlayGone] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const initApp = useCallback(async () => {
    setDbError(null);
    try {
      // Ensure smooth presentation of the Dreamland loading animation on initial launch
      const minDisplayPromise = new Promise((resolve) => setTimeout(resolve, 1100));
      await Promise.all([getDatabase(), minDisplayPromise]);
      setIsDbReady(true);
    } catch (e: any) {
      console.warn('DB initialization error:', e);
      setDbError(e?.message || 'Database error');
    } finally {
      // Hide native splash immediately so the Dreamland animation takes over smoothly
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, []);

  useEffect(() => {
    initApp();
  }, [initApp]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigation />
        {!isOverlayGone && (
          <DreamlandLoadingScreen
            isReady={isDbReady}
            error={dbError}
            onRetry={initApp}
            onAnimationComplete={() => setIsOverlayGone(true)}
          />
        )}
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

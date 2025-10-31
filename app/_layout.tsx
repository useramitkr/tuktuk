//
// 📍 DESTINATION: app/_layout.tsx
//
// ℹ️ DETAILS: This file is MODIFIED from your original.
//
// 1.  It adds the new `story-player` screen to the root <Stack>.
// 2.  `headerShown: false` is set for `(tabs)` to hide the top-level
//     header and only show the bottom tabs.
// 3.  The `story-player` screen is set up to have its own header,
//     which will be configured inside the component itself.
//
// ❗ FIX: Changed alias path (`@/hooks...`) to a relative path
// (`../hooks...`) to fix bundler resolution errors.
//
// -----------------------------------------------------------------------------

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '../hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        {/* ADDED THIS LINE for the story player */}
        <Stack.Screen name="story-player" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}


//
// 📍 DESTINATION: app/_layout.tsx
//
// ℹ️ DETAILS: This file is MODIFIED from your original.
//
// 1.  **FIX (Back Button):** Changed `headerShown: false` to
//     `headerShown: true` for the "story-player" screen.
//
// This allows the `<Stack.Screen>` options *inside* `story-player.tsx`
// to correctly configure the header and show the title and back button.
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

// ❗ FIX: Changed alias path (`@/hooks...`) to a relative path
// (`../hooks...`) to fix bundler resolution errors.
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
        {/* MODIFIED THIS LINE for the story player */}
        <Stack.Screen name="story-player" options={{ presentation: 'modal', headerShown: true }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

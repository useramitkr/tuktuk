//
// 📍 DESTINATION: app/_layout.tsx
//
// ℹ️ DETAILS: This file has been MODIFIED.
//
// 1.  **FIX (Path Alias):** Corrected the import path for `useColorScheme`
//     to use the TypeScript path alias (`@/`) defined in your `tsconfig.json`.
//     The previous relative path (`../`) was incorrect.
//
// 2.  **FIX (Back Button):** Changed `headerShown: false` to
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

// --- FIX: Use the correct path alias ---
import { useColorScheme } from '@/hooks/use-color-scheme';

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

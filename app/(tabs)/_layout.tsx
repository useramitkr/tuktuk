//
// 📍 DESTINATION: app/(tabs)/_layout.tsx
//
// ℹ️ DETAILS: This file has been MODIFIED.
//
// 1.  **FIX (Path Aliases):** Corrected all import paths
//     to use the TypeScript path aliases (`@/`) defined in your `tsconfig.json`.
//     The previous relative paths (`../../`) were incorrect.
//
// -----------------------------------------------------------------------------

import { Tabs } from 'expo-router';
import React from 'react';

// --- FIX: Use path aliases ---
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].background,
          borderTopColor: Colors[colorScheme].card, // Use card color for border
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarButton: HapticTab,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name={focused ? 'house.fill' : 'house.fill'} // Using fill for both, active state handled by color
              weight={focused ? 'bold' : 'regular'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarButton: HapticTab,
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name={focused ? 'paperplane.fill' : 'paperplane.fill'} // Using fill for both
              weight={focused ? 'bold' : 'regular'}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

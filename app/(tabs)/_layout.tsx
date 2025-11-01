import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '../../components/haptic-tab'; // Corrected path
import { IconSymbol } from '../../components/ui/icon-symbol'; // Corrected path
import { Colors } from '../../constants/theme'; // Corrected path
import { useColorScheme } from '../../hooks/use-color-scheme'; // Corrected path

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

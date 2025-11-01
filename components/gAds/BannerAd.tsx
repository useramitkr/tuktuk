//
// 📍 DESTINATION: gAds/BannerAd.tsx
//
// ℹ️ DETAILS: This is a new file for your Banner Ad.
//
// 1.  **Banner Ad:** This component will display a banner ad.
// 2.  **Test ID:** It uses `TestIds.BANNER` to safely show test ads
//     during development.
// 3.  **Usage:** You can import and place this component
//     (e.g., `<BannerAdComponent />`) at the bottom of any screen.
//
// -----------------------------------------------------------------------------

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Use Google's official test ID for banners in __DEV__
// and Google's official demo IDs for production builds for now.
const adUnitId = __DEV__ ? TestIds.BANNER : (
  Platform.OS === 'ios'
    ? 'ca-app-pub-3940256099942544/2934735716' // Google's Demo Banner ID for iOS
    : 'ca-app-pub-3940256099942544/6300978111' // Google's Demo Banner ID for Android
);

export function BannerAdComponent() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={(error) => {
          console.error('Banner Ad failed to load: ', error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // This will stick the ad to the bottom of its container
    // If you want it at the bottom of the screen, its parent needs to be styled correctly
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
});


//
// 📍 DESTINATION: gAds/InterstitialAd.tsx
//
// ℹ️ DETAILS: This file contains the Interstitial Ad component.
//
// 1.  **Interstitial Ad:** This component provides a button to show a
//     full-screen interstitial ad.
// 2.  **Test ID:** Uses `TestIds.INTERSTITIAL`.
// 3.  **Logic:** It loads a new ad in `useEffect` and when an ad is closed.
//     The button is disabled until an ad is loaded.
//
// -----------------------------------------------------------------------------

import React, { useEffect, useState } from 'react';
import { Button, View, StyleSheet } from 'react-native';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// Use Google's official test ID
const adUnitId = TestIds.INTERSTITIAL;

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true, // Example request option
});

export function InterstitialAdComponent() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        console.log('Interstitial Ad loaded');
        setLoaded(true);
      }
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('Interstitial Ad closed');
        setLoaded(false);
        interstitial.load(); // Load next ad
      }
    );

    const unsubscribeError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error('Interstitial Ad failed to load: ', error);
        setLoaded(false);
        // Optionally try to load again after a delay
      }
    );

    // Start loading the first ad
    interstitial.load();

    // Unsubscribe from events on unmount
    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  const showAd = () => {
    if (loaded) {
      interstitial.show();
    } else {
      console.log('Ad not loaded yet');
      // Optionally try to load again
      if (!interstitial.loading) {
         interstitial.load();
      }
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="Show Interstitial Ad"
        onPress={showAd}
        disabled={!loaded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


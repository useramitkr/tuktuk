//
// 📍 DESTINATION: gAds/RewardedAd.tsx
//
// ℹ️ DETAILS: This file contains the Rewarded Ad component.
//
// 1.  **Rewarded Ad:** This component provides a button to show a
//     full-screen video ad that can reward the user.
// 2.  **Test ID:** Uses `TestIds.REWARDED`.
// 3.  **Logic:** Loads an ad in `useEffect`. When the user finishes
//     the ad, the `EARNED_REWARD` event fires.
//
// -----------------------------------------------------------------------------

import React, { useEffect, useState } from 'react';
import { Button, View, StyleSheet } from 'react-native';
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { ThemedText } from '@/components/themed-text';

// Use Google's official test ID
const adUnitId = TestIds.REWARDED;

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

export function RewardedAdComponent() {
  const [loaded, setLoaded] = useState(false);
  const [reward, setReward] = useState<null | { type: string; amount: number }>(null);

  useEffect(() => {
    const unsubscribeLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log('Rewarded Ad loaded');
        setLoaded(true);
      }
    );

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (earnedReward) => {
        console.log('User earned reward: ', earnedReward);
        setReward(earnedReward);
      }
    );

     const unsubscribeClosed = rewarded.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('Rewarded Ad closed');
        setLoaded(false);
        rewarded.load(); // Load next ad
      }
    );

    const unsubscribeError = rewarded.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error('Rewarded Ad failed to load: ', error);
        setLoaded(false);
      }
    );

    // Start loading the first ad
    rewarded.load();

    // Unsubscribe from events on unmount
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  const showAd = () => {
    if (loaded) {
      // Reset reward state before showing
      setReward(null);
      rewarded.show();
    } else {
      console.log('Rewarded Ad not loaded yet');
       if (!rewarded.loading) {
         rewarded.load();
      }
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title="Show Rewarded Video Ad"
        onPress={showAd}
        disabled={!loaded}
      />
      {reward && (
         <ThemedText style={styles.rewardText}>
           Reward earned! Type: {reward.type}, Amount: {reward.amount}
         </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardText: {
    marginTop: 10,
    fontSize: 16,
    color: 'green',
  }
});


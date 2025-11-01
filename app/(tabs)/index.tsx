import React, { useMemo } from 'react';
import {
  StyleSheet,
  SectionList,
  FlatList,
  TouchableOpacity,
  Dimensions,
  View,
  Image,
} from 'react-native';
import { Link } from 'expo-router';

// --- Import REAL components from your project ---
import { ThemedView } from '../../components/themed-view';
import { ThemedText } from '../../components/themed-text';
import ParallaxScrollView from '../../components/parallax-scroll-view';
import { allStories, CATEGORIES } from '../../data/stories';
import { Story } from '../../data/types';
import { BannerAdComponent } from '@/components/gAds/BannerAd';

const { width } = Dimensions.get('window');
const trendingItemWidth = width * 0.7; // 70% of screen width

export default function HomeScreen() {
  // Memoize data preparations
  const trendingStories = useMemo(
    () =>
      allStories
        .map((sf) => sf.story)
        .filter((story) => story.rating >= 4.8), // e.g., Trending = 4.8+ rating
    []
  );

  const categorizedStories = useMemo(() => {
    return CATEGORIES.map((category) => ({
      title: category.title,
      data: allStories
        .map((sf) => sf.story)
        .filter((story) => story.category === category.id),
    })).filter((section) => section.data.length > 0); // Only show categories that have stories
  }, []);

  // Render function for a single TRENDING story card
  const renderTrendingItem = ({ item }: { item: Story }) => (
    <Link
      href={{ pathname: '/story-player', params: { storyId: item.id } }}
      asChild>
      <TouchableOpacity style={styles.trendingItem}>
        <Image source={{ uri: item.image }} style={styles.trendingImage} />
        <ThemedText type="defaultSemiBold" style={styles.trendingTitle}>
          {item.title}
        </ThemedText>
      </TouchableOpacity>
    </Link>
  );

  // Render function for a single story ROW in the SectionList
  const renderStoryItem = ({ item }: { item: Story }) => (
    <Link
      href={{ pathname: '/story-player', params: { storyId: item.id } }}
      asChild>
      <TouchableOpacity style={styles.storyRow}>
        <Image source={{ uri: item.image }} style={styles.storyRowImage} />
        {/* <BannerAdComponent /> */}
        <View style={styles.storyRowTextContainer}>
          <ThemedText type="defaultSemiBold" style={styles.storyRowTitle}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.storyRowDescription} numberOfLines={2}>
            {item.description}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </Link>
  );

  // Render function for the CATEGORY title
  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => <ThemedText type="title" style={styles.sectionHeader}>{title}</ThemedText>;

  return (
    <ParallaxScrollView
      headerImage={
        <Image
          source={{
            uri: 'https://placehold.co/600x400/4A90E2/FFFFFF?text=Chat+Stories&font=lato',
          }}
          style={styles.headerImage}
        />
      }
      headerBackgroundColor={{ light: '#D0EFFF', dark: '#102C44' }}>
      <ThemedView style={styles.contentContainer}>
        {/* --- Trending Section --- */}
        <ThemedText type="title" style={styles.sectionTitle}>
          Trending Now
        </ThemedText>
        <FlatList
          data={trendingStories}
          renderItem={renderTrendingItem}
          keyExtractor={(item) => 'trend-' + item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.trendingList}
        />

        {/* --- All Stories Section --- */}
        <SectionList
          sections={categorizedStories}
          renderItem={renderStoryItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} // Let ParallaxScrollView handle scrolling
          contentContainerStyle={styles.sectionListContent}
          ListFooterComponent={<View style={{ height: 50 }} />} // Add some padding at the bottom
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    paddingTop: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  // --- Trending List Styles ---
  trendingList: {
    marginBottom: 24,
    paddingLeft: 16, // So the first item doesn't touch the edge
  },
  trendingItem: {
    width: trendingItemWidth,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: '#f8f8f8', // Light background for card
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // for Android
  },
  trendingImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#e0e0e0', // Placeholder bg
  },
  trendingTitle: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: '#111', // Ensure text is dark on light card
  },
  // --- SectionList Styles ---
  sectionListContent: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingTop: 16, // Add spacing above new sections
    paddingBottom: 12,
  },
  storyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#f8f8f8', // Light background for card
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2, // for Android
  },
  storyRowImage: {
    width: 80,
    height: 80,
    backgroundColor: '#e0e0e0', // Placeholder bg
  },
  storyRowTextContainer: {
    flex: 1,
    padding: 12,
    backgroundColor: 'transparent', // Ensure it doesn't have a nested bg
  },
  storyRowTitle: {
    fontSize: 16,
    color: '#111', // Ensure text is dark on light card
  },
  storyRowDescription: {
    fontSize: 14,
    color: '#555', // Slightly dimmer text color
    marginTop: 4,
  },
});

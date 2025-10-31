import React, { useMemo } from 'react';
import {
  StyleSheet,
  SectionList,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Text,
  View,
  Image,
} from 'react-native';

// --- Re-implemented Components ---
// These are basic versions of the components that were causing errors.

// Basic <ThemedView> replacement
const ThemedView = (props: View['props']) => {
  const { style, ...otherProps } = props;
  return <View style={style} {...otherProps} />;
};

// Basic <ThemedText> replacement
const ThemedText = (props: Text['props']) => {
  const { style, type, ...otherProps } = props;
  const fontSize = type === 'title' ? 24 : type === 'defaultSemiBold' ? 16 : 16;
  const fontWeight = type === 'title' ? 'bold' : type === 'defaultSemiBold' ? '600' : 'normal';

  // In a real app, this would also check for dark mode
  const color = '#000'; // Assuming light mode for this fix

  return <Text style={[{ color, fontSize, fontWeight }, style]} {...otherProps} />;
};

// Basic <ParallaxScrollView> replacement (just a regular ScrollView)
const ParallaxScrollView = (props: ScrollView['props']) => {
  const { children, headerImage, ...otherProps } = props;
  return (
    <ScrollView {...otherProps}>
      <View style={styles.headerImageContainer}>{headerImage}</View>
      {children}
    </ScrollView>
  );
};

// Basic <Link> replacement (just a TouchableOpacity)
const Link = (props: { href: any; asChild: boolean; children: React.ReactElement }) => {
  // This is a simplified stand-in for expo-router's Link
  // It copies the `onPress` from its child (the TouchableOpacity)
  return React.cloneElement(props.children, {
    // In a real app, this would have navigation logic
    onPress: () => {
      console.log('Navigate to:', props.href.pathname, props.href.params);
      // In this environment, we can't navigate, so we'll just log
    },
  });
};

// --- Your Mock Data ---

// Categories
const CATEGORIES = [
  { id: 'c1', title: 'Horror' },
  { id: 'c2', title: 'Romance' },
  { id: 'c3', title: 'Sci-Fi' },
  { id: 'c4', title: 'Mystery' },
  { id: 'c5', title: 'Comedy' },
];

// Stories
const STORIES = [
  {
    id: 's1',
    category: 'c1',
    title: "Don't Open the JSON",
    description:
      "Your friend Meera found an old hard drive. There's one file on it. And she's about to open it.",
    rating: 5.0,
    image: 'https://placehold.co/300x400/000000/ff0000?text=WARNING',
  },
  {
    id: 's2',
    category: 'c2',
    title: 'Life After',
    description:
      'The apartment is too quiet now. You navigate the silence and the texts from well-meaning friends.',
    rating: 4.5,
    image: 'https://placehold.co/300x400/a3b1c6/ffffff?text=Life+After',
  },
  {
    id: 's3',
    category: 'c4',
    title: 'The 4:05 AM Passenger',
    description:
      "Your last ride of the night is from an abandoned industrial park. And it's 4:05 AM.",
    rating: 4.8,
    image: 'https://placehold.co/300x400/33334d/e0e0e0?text=4:05+AM',
  },
  {
    id: 's4',
    category: 'c5',
    title: "Grandma's New Phone",
    description:
      "You're trying to teach your Grandma how to use a smartphone. You are their emotional support.",
    rating: 4.9,
    image: 'https://placehold.co/300x400/f0e68c/333?text=HELP',
  },
  {
    id: 's5',
    category: 'c3',
    title: 'The Glitch in Sector 7',
    description:
      'A routine diagnostic on a deep-space station uncovers a signal that isn\'t human.',
    rating: 4.7,
    image: 'https://placehold.co/300x400/1a1a1a/e0e0e0?text=Sector+7',
  },
  {
    id: 's6',
    category: 'c4',
    title: 'The Midnight Feed',
    description:
      'You find a hidden social media account that predicts the future. Then, you see your name.',
    rating: 4.9,
    image: 'https://placehold.co/300x400/1a1a1a/e0e0e0?text=Midnight+Feed',
  },
  {
    id: 's7',
    category: 'c2',
    title: 'The Last Train to Paris',
    description:
      'Two strangers are the only passengers on an overnight train. But they\'ve met before.',
    rating: 4.6,
    image: 'https://placehold.co/300x400/1a1a1a/e0e0e0?text=Train+to+Paris',
  },
];

const { width } = Dimensions.get('window');
const trendingItemWidth = width * 0.7; // 70% of screen width

export default function HomeScreen() {
  // Memoize data preparations
  const trendingStories = useMemo(
    () => STORIES.filter((story) => story.rating >= 4.8), // e.g., Trending = 4.8+ rating
    []
  );

  const categorizedStories = useMemo(() => {
    return CATEGORIES.map((category) => ({
      title: category.title,
      data: STORIES.filter((story) => story.category === category.id),
    })).filter((section) => section.data.length > 0); // Only show categories that have stories
  }, []);

  // Render function for a single TRENDING story card
  const renderTrendingItem = ({
    item,
  }: {
    item: (typeof STORIES)[0];
  }) => (
    <Link href={{ pathname: '/story-detail', params: { storyId: item.id } }} asChild>
      <TouchableOpacity style={styles.trendingItem}>
        <Image source={{ uri: item.image }} style={styles.trendingImage} />
        <ThemedText type="defaultSemiBold" style={styles.trendingTitle}>
          {item.title}
        </ThemedText>
      </TouchableOpacity>
    </Link>
  );

  // Render function for a single story ROW in the SectionList
  const renderStoryItem = ({
    item,
  }: {
    item: (typeof STORIES)[0];
  }) => (
    <Link href={{ pathname: '/story-detail', params: { storyId: item.id } }} asChild>
      <TouchableOpacity style={styles.storyRow}>
        <Image source={{ uri: item.image }} style={styles.storyRowImage} />
        <ThemedView style={styles.storyRowTextContainer}>
          <ThemedText type="defaultSemiBold" style={styles.storyRowTitle}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.storyRowDescription} numberOfLines={2}>
            {item.description}
          </ThemedText>
        </ThemedView>
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
    >
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
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImageContainer: {
    backgroundColor: '#D0EFFF', // Light blue background
  },
  headerImage: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    paddingTop: 16,
    backgroundColor: '#ffffff', // Set a default light background
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
  },
  // --- SectionList Styles ---
  sectionListContent: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingTop: 16, // Add spacing above new sections
    paddingBottom: 12,
    backgroundColor: '#ffffff', // Match content background
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
  },
  storyRowDescription: {
    fontSize: 14,
    color: '#555', // Slightly dimmer text color
    marginTop: 4,
  },
});


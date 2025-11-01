//
// 📍 DESTINATION: app/story-player.tsx
//
// ℹ️ DETAILS: No code changes were needed in this file.
//
// The chat page is already scrollable! It uses an `inverted` FlatList.
// This means new messages are added to the top of the list data (which
// appears at the bottom of the screen), and you can scroll "up" (which
// is technically scrolling "down" the list) to read all previous messages.
//
// This functionality was part of the fix in the previous turn.
//
// -----------------------------------------------------------------------------

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
// --- Use path aliases as defined in tsconfig.json ---
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme'; // Import colors
import { storiesById } from '@/data/stories';
import { Character, Message, MessageOption } from '@/data/types';
import { useColorScheme } from '@/hooks/use-color-scheme'; // Import useColorScheme
import { useThemeColor } from '@/hooks/use-theme-color'; // Import useThemeColor
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DisplayMessage = Message & {
  character: Character;
};

type SavedProgress = {
  currentMessageId: string | null;
  displayedMessages: DisplayMessage[];
  storyEnded: boolean;
};

export default function StoryPlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { storyId } = params;
  const colorScheme = useColorScheme() ?? 'light';

  // Find the story file from our imported data
  const storyFile = React.useMemo(() => {
    if (typeof storyId !== 'string') return null;
    return storiesById.get(storyId);
  }, [storyId]);

  const [isLoading, setIsLoading] = useState(true);
  const [currentMessageId, setCurrentMessageId] = React.useState<string | null>(
    null
  );

  const [displayedMessages, setDisplayedMessages] = React.useState<
    DisplayMessage[]
  >([]);

  const [storyEnded, setStoryEnded] = useState(false);
  const tapOpacity = useRef(new Animated.Value(1)).current;
  const [isScrolling, setIsScrolling] = useState(false);

  const storyData = storyFile?.storyData[storyId as string];
  const characters = storyFile?.characters;
  const storageKey = `story-progress-${storyId}`;

  // --- Load progress from AsyncStorage ---
  useEffect(() => {
    const loadProgress = async () => {
      if (!storyData || !characters) {
        setIsLoading(false);
        return;
      }

      try {
        const savedData = await AsyncStorage.getItem(storageKey);
        if (savedData) {
          const {
            currentMessageId: savedMsgId,
            displayedMessages: savedDisplayMsgs,
            storyEnded: savedStoryEnded,
          } = JSON.parse(savedData) as SavedProgress;

          setDisplayedMessages(savedDisplayMsgs);
          setCurrentMessageId(savedMsgId);
          setStoryEnded(savedStoryEnded);
        } else {
          // No saved data, start new game
          const firstMessageId = storyData.firstMessage;
          const firstMessage = storyData.messageMap[firstMessageId];
          if (firstMessage) {
            const firstDisplayMessage = {
              ...firstMessage,
              character: characters[firstMessage.user],
            };
            setDisplayedMessages([firstDisplayMessage]);
            setCurrentMessageId(firstMessageId);
            setStoryEnded(!firstMessage.next && !firstMessage.options);
          }
        }
      } catch (e) {
        console.error('Failed to load story progress:', e);
        // Fallback to starting new game on error
        const firstMessageId = storyData.firstMessage;
        const firstMessage = storyData.messageMap[firstMessageId];
        if (firstMessage) {
          const firstDisplayMessage = {
            ...firstMessage,
            character: characters[firstMessage.user],
          };
          setDisplayedMessages([firstDisplayMessage]);
          setCurrentMessageId(firstMessageId);
          setStoryEnded(!firstMessage.next && !firstMessage.options);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [storyId, storyData, characters, storageKey]);

  // --- Save progress to AsyncStorage ---
  useEffect(() => {
    const saveProgress = async () => {
      if (isLoading || displayedMessages.length === 0) return; // Don't save on initial load

      try {
        const data: SavedProgress = {
          currentMessageId,
          displayedMessages,
          storyEnded,
        };
        await AsyncStorage.setItem(storageKey, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save story progress:', e);
      }
    };

    saveProgress();
  }, [displayedMessages, currentMessageId, storyEnded, storageKey, isLoading]);


  const currentMessage =
    currentMessageId && storyData
      ? storyData.messageMap[currentMessageId]
      : null;

  const currentOptions = currentMessage?.options ?? [];
  const canAdvance = currentOptions.length === 0 && !!currentMessage?.next;

  // Start blinking animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(tapOpacity, {
          toValue: 0.2,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tapOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [tapOpacity]);


  const handleScreenTap = () => {
    // If the user is currently scrolling, ignore taps so scrolling isn't interrupted
    if (isScrolling) return;
    if (storyEnded) {
      // If story ended, tap to go back
      if (router.canGoBack()) {
        router.back();
      }
      return;
    }

    if (!canAdvance || !storyData || !characters || !currentMessage) {
      // If there are options, tap is disabled.
      // If there's no `next` message, story is over.
      if (!currentMessage?.next && !currentMessage?.options) {
        setStoryEnded(true);
      }
      return;
    }

    const nextMessageId = currentMessage.next;
    if (nextMessageId) {
      const nextMessage = storyData.messageMap[nextMessageId];
      if (nextMessage) {
        setCurrentMessageId(nextMessageId);
        // *** THIS IS THE FIX ***
        // Add new messages to the START of the array for an inverted list
        setDisplayedMessages((prev) => [
          {
            ...nextMessage,
            character: characters[nextMessage.user],
          },
          ...prev,
        ]);

        // Check if this new message is the end
        if (!nextMessage.next && !nextMessage.options) {
          setStoryEnded(true);
        }
      }
    }
  };

  const handleOptionPress = (option: MessageOption) => {
    if (!storyData || !characters) return;

    const nextMessageId = option.next;
    const nextMessage = storyData.messageMap[nextMessageId];
    if (nextMessage) {
      setCurrentMessageId(nextMessageId);

      const selfUserKey = Object.keys(characters).find(key => characters[key].isSelf) || '0';
      const selfCharacter = Object.values(characters).find(c => c.isSelf) || characters[selfUserKey];

      // *** THIS IS THE FIX ***
      // Add new messages to the START of the array
      setDisplayedMessages((prev) => [
        {
          ...nextMessage,
          character: characters[nextMessage.user],
        },
        {
          _id: `choice-${nextMessageId}`,
          text: option.text,
          user: selfUserKey,
          character: selfCharacter,
        },
        ...prev,
      ]);

      // Check if this new message is the end
      if (!nextMessage.next && !nextMessage.options) {
        setStoryEnded(true);
      }
    }
  };

  const backgroundColor = useThemeColor({}, 'background');
  const optionButtonColor = useThemeColor({}, 'optionButton');
  const optionButtonTextColor = useThemeColor({}, 'optionButtonText');
  const footerTextColor = useThemeColor({}, 'bubbleSystemText'); // Use system text color for footer

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        <ThemedText>Loading story...</ThemedText>
      </ThemedView>
    );
  }

  if (!storyFile || !storyData || !characters) {
    return (
      <ThemedView style={styles.container}>
        {/* Added Stack.Screen here to provide a back button even on error */}
        <Stack.Screen options={{
          title: 'Error',
          headerBackTitle: 'Back',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
              <Ionicons name="arrow-back" size={22} color={Colors[colorScheme].text} />
            </Pressable>
          ),
        }} />
        <ThemedText>Story not found!</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: backgroundColor },
      ]}>
      {/* This controls the header for this screen */}
      <Stack.Screen options={{
        title: storyFile.story.title,
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: Colors[colorScheme].card },
        headerTintColor: Colors[colorScheme].text,
        headerTitleStyle: { color: Colors[colorScheme].text },
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
            <Ionicons name="arrow-back" size={22} color={Colors[colorScheme].text} />
          </Pressable>
        ),
      }} />

      <Pressable onPress={handleScreenTap} style={styles.pressableArea}>
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={displayedMessages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <MessageBubble message={item} width={width} colorScheme={colorScheme} />
          )}
          inverted // This makes the list start from the bottom
          ListFooterComponent={<View style={{ height: 20 }} />} // Spacer at the "end" (top)
          onScrollBeginDrag={() => setIsScrolling(true)}
          onScrollEndDrag={() => setIsScrolling(false)}
          onMomentumScrollEnd={() => setIsScrolling(false)}
        />

        {/* --- Footer Text --- */}
        <ThemedView style={styles.footerContainer}>
          {storyEnded ? (
            <ThemedText style={[styles.footerText, { color: footerTextColor }]}>The End</ThemedText>
          ) : canAdvance ? (
            <Animated.Text style={[styles.footerText, { opacity: tapOpacity, color: footerTextColor }]}>
              Tap to show next chat
            </Animated.Text>
          ) : null}
        </ThemedView>

        {/* Options Area */}
        {currentOptions.length > 0 && !storyEnded && (
          <ThemedView style={[styles.optionsContainer, { borderTopColor: Colors[colorScheme].card }]}>
            {currentOptions.map((option) => (
              <Pressable
                key={option.next}
                onPress={() => handleOptionPress(option)}
                style={[styles.optionButton, { backgroundColor: optionButtonColor }]}>
                <ThemedText style={[styles.optionButtonText, { color: optionButtonTextColor }]}>
                  {option.text}
                </ThemedText>
              </Pressable>
            ))}
          </ThemedView>
        )}
      </Pressable>
    </ThemedView>
  );
}

const MessageBubble = React.memo(({
  message,
  width,
  colorScheme
}: {
  message: DisplayMessage;
  width: number;
  colorScheme: 'light' | 'dark';
}) => {
  const isSelf = message.character?.isSelf || false;
  const isSystem = message.character?.name === 'Narrator';
  const bubbleAlignment = isSelf ? 'flex-end' : 'flex-start';

  // Get colors from theme
  const bubbleColor = isSelf
    ? Colors[colorScheme].bubbleSelf
    : isSystem
      ? 'transparent'
      : Colors[colorScheme].bubbleOther;

  const textColor = isSelf
    ? Colors[colorScheme].bubbleSelfText
    : isSystem
      ? Colors[colorScheme].bubbleSystemText
      : Colors[colorScheme].bubbleOtherText;

  const fontStyle = isSystem ? 'italic' : 'normal';
  const textAlign = isSystem ? 'center' : 'left';

  return (
    <View
      style={[
        styles.messageRow,
        {
          justifyContent: isSystem ? 'center' : bubbleAlignment,
          alignSelf: isSystem ? 'center' : bubbleAlignment,
        },
      ]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: bubbleColor,
            maxWidth: width * (isSystem ? 0.9 : 0.75), // Max width
            alignSelf: bubbleAlignment,
          },
        ]}>
        {!isSelf && !isSystem && (
          <ThemedText style={[styles.characterName, { color: Colors[colorScheme].bubbleSystemText }]}>
            {message.character.name}
          </ThemedText>
        )}
        {message.image && (
          <Image
            source={{ uri: message.image }}
            style={[styles.image, { width: width * 0.7, height: width * 0.5 }]}
            resizeMode="cover"
          />
        )}
        {message.text ? (
          <ThemedText style={{ color: textColor, fontStyle: fontStyle, textAlign: textAlign, fontSize: 16, lineHeight: 22 }}>
            {message.text}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
});

// Give the memoized component a display name for better debugging/linting
(MessageBubble as any).displayName = 'MessageBubble';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  pressableArea: {
    flex: 1,
    justifyContent: 'flex-end', // Pushes content to bottom
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 10, // Padding at the "top" (which is the end of the chat)
    justifyContent: 'flex-end',
    flexGrow: 1,
  },
  messageRow: {
    marginVertical: 5, // Increased vertical margin
    flexDirection: 'row',
  },
  bubble: {
    borderRadius: 20, // Slightly more rounded
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  characterName: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 12,
  },
  image: {
    borderRadius: 10,
    marginBottom: 5,
  },
  optionsContainer: {
    padding: 20,
    borderTopWidth: 1,
    // borderTopColor: '#E5E5EA', // Will be set by theme
  },
  optionButton: {
    // backgroundColor: '#007AFF', // Will be set by theme
    padding: 15,
    borderRadius: 14, // More rounded
    alignItems: 'center',
    marginBottom: 10,
  },
  optionButtonText: {
    // color: '#FFFFFF', // Will be set by theme
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40, // Give it some space
    backgroundColor: 'transparent', // Inherit from parent
  },
  footerText: {
    fontSize: 14,
    // color: '#8A8A8E', // Will be set by theme
    fontStyle: 'italic',
  },
});

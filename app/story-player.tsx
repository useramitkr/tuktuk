//
// 📍 DESTINATION: app/story-player.tsx
//
// ℹ️ DETAILS: This file has been MODIFIED to fix your chat logic and add new features.
//
// 1.  **FIX (Chat Scrolling):** The `inverted` FlatList was correct, but new messages
//     were being added to the *end* of the array (`[...prev, newMessage]`).
//     For an inverted list, they must be added to the *beginning*
//     (`[newMessage, ...prev]`). This stops the list from "jumping"
//     to the top and makes new messages appear at the bottom, as you wanted.
//
// 2.  **FEATURE (End of Story):** Added a state `storyEnded`. This is set to `true`
//     when a message has no `next` or `options`.
//
// 3.  **FEATURE (Blinking Footer):**
//     - Added an `Animated.Text` component.
//     - If `storyEnded` is true, it shows "The End".
//     - If the story is not ended AND `canAdvance` is true, it shows a
//       blinking "Tap to show next chat" prompt.
//     - If there are options, it shows nothing.
//
// 4.  **FIX (Navigation):** Tapping the screen now checks for `storyEnded`.
//     - If the story is over, tapping the screen will navigate back.
//     - If the story is not over, it advances the chat.
//
// 5.  **FIX (Imports):** Changed relative import paths (`../`) to
//     use the TypeScript path aliases (`@/`) defined in your tsconfig.json
//     to resolve the compilation errors.
//
// -----------------------------------------------------------------------------

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
// --- Use path aliases as defined in tsconfig.json ---
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { storiesById } from '@/data/stories';
import { Character, Message, MessageOption } from '@/data/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DisplayMessage = Message & {
  character: Character;
};

export default function StoryPlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { storyId } = params;

  // Find the story file from our imported data
  const storyFile = React.useMemo(() => {
    if (typeof storyId !== 'string') return null;
    return storiesById.get(storyId);
  }, [storyId]);

  const [currentMessageId, setCurrentMessageId] = React.useState<string | null>(
    storyFile?.storyData[storyId as string]?.firstMessage ?? null
  );

  const [displayedMessages, setDisplayedMessages] = React.useState<
    DisplayMessage[]
  >([]);

  const [storyEnded, setStoryEnded] = useState(false);
  const tapOpacity = useRef(new Animated.Value(1)).current;

  const storyData = storyFile?.storyData[storyId as string];
  const characters = storyFile?.characters;

  const currentMessage =
    currentMessageId && storyData
      ? storyData.messageMap[currentMessageId]
      : null;

  const currentOptions = currentMessage?.options ?? [];
  const canAdvance = currentOptions.length === 0 && !!currentMessage?.next;

  // Add the first message when the component loads
  React.useEffect(() => {
    if (currentMessageId && storyData && characters && displayedMessages.length === 0) {
      const firstMessage = storyData.messageMap[currentMessageId];
      if (firstMessage) {
        setDisplayedMessages([
          {
            ...firstMessage,
            character: characters[firstMessage.user],
          },
        ]);
        // Check if the very first message is also the end
        if (!firstMessage.next && !firstMessage.options) {
          setStoryEnded(true);
        }
      }
    }
  }, [currentMessageId, storyData, characters, displayedMessages.length]);

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

  if (!storyFile || !storyData || !characters) {
    return (
      <ThemedView style={styles.container}>
        {/* Added Stack.Screen here to provide a back button even on error */}
        <Stack.Screen options={{ title: 'Error', headerBackTitle: 'Back' }} />
        <ThemedText>Story not found!</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      {/* This controls the header for this screen */}
      <Stack.Screen options={{ title: storyFile.story.title, headerBackTitle: 'Back' }} />

      <Pressable onPress={handleScreenTap} style={styles.pressableArea}>
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={displayedMessages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <MessageBubble message={item} width={width} />
          )}
          inverted // This makes the list start from the bottom
          ListFooterComponent={<View style={{ height: 20 }} />} // Spacer at the "end" (top)
        />

        {/* --- Footer Text --- */}
        <ThemedView style={styles.footerContainer}>
          {storyEnded ? (
            <ThemedText style={styles.footerText}>The End</ThemedText>
          ) : canAdvance ? (
            <Animated.Text style={[styles.footerText, { opacity: tapOpacity }]}>
              Tap to show next chat
            </Animated.Text>
          ) : null}
        </ThemedView>

        {/* Options Area */}
        {currentOptions.length > 0 && (
          <ThemedView style={styles.optionsContainer}>
            {currentOptions.map((option) => (
              <Pressable
                key={option.next}
                onPress={() => handleOptionPress(option)}
                style={styles.optionButton}>
                <ThemedText style={styles.optionButtonText}>
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

const MessageBubble = ({
  message,
  width,
}: {
  message: DisplayMessage;
  width: number;
}) => {
  const isSelf = message.character?.isSelf || false;
  const isSystem = message.character?.name === 'Narrator';
  const bubbleAlignment = isSelf ? 'flex-end' : 'flex-start';
  const bubbleColor = isSelf
    ? '#007AFF'
    : isSystem
    ? 'transparent'
    : '#E5E5EA';
  const textColor = isSelf ? '#FFFFFF' : isSystem ? '#8A8A8E' : '#000000';
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
          <ThemedText style={[styles.characterName, { color: '#8A8A8E' }]}>
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
          <ThemedText style={{ color: textColor, fontStyle: fontStyle, textAlign: textAlign }}>
            {message.text}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginVertical: 4,
    flexDirection: 'row',
  },
  bubble: {
    borderRadius: 18,
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
    // paddingBottom: 30, // No longer needed, insets.bottom handles it
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  optionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  optionButtonText: {
    color: '#FFFFFF',
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
    color: '#8A8A8E', // System-like text color
    fontStyle: 'italic',
  },
});


//
// 📍 DESTINATION: app/story-player.tsx
//
// ℹ️ DETAILS: This is a new file.
// PURPOSE: This screen plays the selected story.
//
// 1.  It uses `useLocalSearchParams` to get the `storyId` passed from the
//     home screen's <Link> component.
// 2.  It uses `storiesById` from `data/stories/index.ts` to find the
//     correct story data.
// 3.  It uses `useState` to track the `currentMessageId` and the
//     list of `displayedMessages`.
// 4.  The entire screen is a `Pressable` (wrapped in `SafeAreaView`).
//     Tapping it advances the story to the `next` message.
// 5.  If a message has `options`, it displays buttons instead, and
//     tapping the screen does nothing until an option is chosen.
// 6.  It renders messages from "self" on the right and others on the left.
//
// ❗ FIX: Changed alias paths (`@/components...`, `@/data...`) to
// relative paths (`../components...`, `../data...`) to fix
// bundler resolution errors.
//
// -----------------------------------------------------------------------------

import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Image,
  Button,
  useWindowDimensions,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { storiesById } from '../data/stories';
import { Character, Message, MessageOption, StoryFile } from '../data/types';
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

  const storyData = storyFile?.storyData[storyId as string];
  const characters = storyFile?.characters;

  const currentMessage =
    currentMessageId && storyData
      ? storyData.messageMap[currentMessageId]
      : null;

  const currentOptions = currentMessage?.options ?? [];
  const canAdvance = currentOptions.length === 0 && currentMessage?.next;

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
      }
    }
  }, [currentMessageId, storyData, characters, displayedMessages.length]);


  const handleScreenTap = () => {
    if (!canAdvance || !storyData || !characters || !currentMessage) {
      // If there are options, tap is disabled.
      // If there's no `next` message, story is over.
      if (!currentMessage?.next && !currentMessage?.options) {
        // End of story, navigate back
        if (router.canGoBack()) {
          router.back();
        }
      }
      return;
    }

    const nextMessageId = currentMessage.next;
    if (nextMessageId) {
      const nextMessage = storyData.messageMap[nextMessageId];
      if (nextMessage) {
        setCurrentMessageId(nextMessageId);
        setDisplayedMessages((prev) => [
          ...prev,
          {
            ...nextMessage,
            character: characters[nextMessage.user],
          },
        ]);
      }
    }
  };

  const handleOptionPress = (option: MessageOption) => {
    if (!storyData || !characters) return;

    const nextMessageId = option.next;
    const nextMessage = storyData.messageMap[nextMessageId];
    if (nextMessage) {
      setCurrentMessageId(nextMessageId);
      setDisplayedMessages((prev) => [
        ...prev,
        // Add the choice itself as a "self" message
        {
          _id: `choice-${nextMessageId}`,
          text: option.text,
          user: Object.keys(characters).find(key => characters[key].isSelf) || '0',
          character: Object.values(characters).find(c => c.isSelf) || characters['0'],
        },
        // Add the next message in the story
        {
          ...nextMessage,
          character: characters[nextMessage.user],
        },
      ]);
    }
  };

  if (!storyFile || !storyData || !characters) {
    return (
      <ThemedView style={styles.container}>
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
    paddingBottom: 30, // Extra padding for home bar etc.
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
});


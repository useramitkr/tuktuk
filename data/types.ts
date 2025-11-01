//
// 📍 DESTINATION: data/types.ts
//
// ℹ️ DETAILS: This is a new file.
// PURPOSE: To define the TypeScript types for your story JSON structure.
// This helps prevent errors and provides better editor autocompletion.
//
// -----------------------------------------------------------------------------

export interface Story {
  id: string;
  category: string;
  title: string;
  description: string;
  rating: number;
  image: string;
}

export interface Character {
  name: string;
  isSelf: boolean;
}

export interface MessageOption {
  text: string;
  next: string;
}

export interface Message {
  _id: string;
  // Some story JSON files use numeric keys for users (e.g. 0, 1).
  // Accept both string and number here to match the JSON data.
  user: string | number; // Corresponds to a key in the characters object
  // Some messages carry only an image and no text. Make text optional.
  text?: string;
  next?: string;
  image?: string;
  options?: MessageOption[];
}

export interface StoryData {
  firstMessage: string;
  messageMap: {
    [messageId: string]: Message;
  };
}

export interface StoryFile {
  story: Story;
  characters: {
    [characterId: string]: Character;
  };
  storyData: {
    [storyId: string]: StoryData;
  };
}

//
// 📍 DESTINATION: data/stories/index.ts
//
// ℹ️ DETAILS: This is a new file.
// PURPOSE: This file imports all your separate story .json files and
// combines them into a single `allStories` array. It also creates a
// `storiesById` Map for fast lookups, which we will use on the
// story player page. This makes your data much easier to manage.
//
// -----------------------------------------------------------------------------

import { StoryFile } from '@/data/types';

// Import all your story JSON files
import story1 from './demoStory1.json';
import story2 from './lifeafter.json';
import story3 from './passenger.json';
import story4 from './grandmaa.json';

// Cast them to the StoryFile type for type safety
const allStories: StoryFile[] = [
  story1 as StoryFile,
  story2 as StoryFile,
  story3 as StoryFile,
  story4 as StoryFile,
];

// Create a Map for easy lookup by story.id
// Example: storiesById.get('s1') will return the "Don't Open the JSON" story
const storiesById = new Map<string, StoryFile>(
  allStories.map((storyFile) => [storyFile.story.id, storyFile])
);

// Create a list of categories based on the stories
const CATEGORIES = [
  { id: 'Horror', title: 'Horror' },
  { id: 'Love', title: 'Love' },
  { id: 'Comedy', title: 'Comedy' },
];

export { allStories, storiesById, CATEGORIES };

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

// Colors for the dark theme based on the user's image
const darkBackground = '#121212';
const darkBubbleSelf = '#373737';
const darkBubbleOther = '#6A5AE0'; // A vibrant purple
const darkCard = '#1C1C1E'; // Slightly lighter than bg
const darkText = '#E0E0E0';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: '#f8f8f8',
    bubbleSelf: '#007AFF',
    bubbleSelfText: '#FFFFFF',
    bubbleOther: '#E5E5EA',
    bubbleOtherText: '#000000',
    bubbleSystemText: '#8A8A8E',
    optionButton: '#007AFF',
    optionButtonText: '#FFFFFF',
  },
  dark: {
    text: darkText,
    background: darkBackground,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    card: darkCard,
    bubbleSelf: darkBubbleSelf,
    bubbleSelfText: '#FFFFFF',
    bubbleOther: darkBubbleOther,
    bubbleOtherText: '#FFFFFF',
    bubbleSystemText: '#8A8A8E',
    optionButton: darkBubbleOther,
    optionButtonText: '#FFFFFF',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

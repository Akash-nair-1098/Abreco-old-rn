import { Dimensions } from 'react-native';

// Get device width and height
const { width, height } = Dimensions.get('window');

// Export constants
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Optionally, define scaling helpers (recommended)
export const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
export const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

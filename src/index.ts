// @decentralized-games/card-components
// React component library for playing cards

// Components
export { Card, CardFace, CardBack } from './components';
export type {
  CardProps,
  CardRef,
  CardClickData,
  AspectRatio,
  Perspective,
  SpringPreset,
} from './components';

// Types
export { SUITS, RANKS, parseCard, formatCard, allCards, isSuit, isRank } from './types';
export type { Suit, Rank, CardData } from './types';

// Constants
export {
  SUIT_EMOJI,
  SUIT_COLORS_TWO,
  SUIT_COLORS_FOUR,
  getSuitColor,
  SPRING_PRESETS,
  PERSPECTIVE_VALUES,
  ASPECT_RATIOS,
} from './constants';
export type { ColorScheme, SpringConfig, PerspectiveLevel, AspectRatioPreset } from './constants';

// Hooks (for advanced usage)
export { useCardFlip, usePrefersReducedMotion } from './hooks';
export type { UseCardFlipOptions, UseCardFlipReturn, SpringPresetOrCustom } from './hooks';

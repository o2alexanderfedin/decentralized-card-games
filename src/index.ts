// @decentralized-games/card-components
// React component library for playing cards

// Components (Phase 1 + Phase 2)
export { Card, CardFace, CardBack } from './components';
export { Hand } from './components';
export { Deck } from './components';
export { CardStack } from './components';
export { DropZone } from './components';
export { DraggableCard } from './components';
export { CardDragOverlay } from './components';
export { DroppableZone } from './components';
export { CardDndProvider } from './components';
export { StatefulCardDndProvider } from './components';
export type {
  // Phase 1 component types
  CardProps,
  CardRef,
  CardClickData,
  AspectRatio,
  Perspective,
  SpringPreset,
  // Phase 2 component types
  HandProps,
  HandRef,
  HandLayout,
  HoverEffect,
  DeckProps,
  DeckRef,
  DeckEmptyState,
  CardStackProps,
  FaceUpMode,
  DropZoneProps,
  DropZoneEmptyState,
  DropZoneVisualState,
  // Phase 3 component types
  DraggableCardProps,
  CardDragOverlayProps,
  DroppableZoneProps,
  CardDndProviderProps,
  // Phase 4 component types
  StatefulCardDndProviderProps,
} from './components';

// Types
export { SUITS, RANKS, parseCard, formatCard, allCards, isSuit, isRank } from './types';
export type { Suit, Rank, CardData, CardInput, CardLayout } from './types';
export { normalizeCard } from './types';

// Constants
export {
  SUIT_EMOJI,
  SUIT_COLORS_TWO,
  SUIT_COLORS_FOUR,
  getSuitColor,
  SPRING_PRESETS,
  PERSPECTIVE_VALUES,
  ASPECT_RATIOS,
  FAN_PRESETS,
  LAYOUT_DEFAULTS,
} from './constants';
export type {
  ColorScheme,
  SpringConfig,
  PerspectiveLevel,
  AspectRatioPreset,
  FanPreset,
} from './constants';

// Utilities (Phase 2)
export {
  calculateFanLayout,
  calculateSpreadLayout,
  calculateStackLayout,
} from './utils';
export type {
  FanLayoutOptions,
  SpreadLayoutOptions,
  StackLayoutOptions,
} from './utils';

// Hooks (Phase 1-3)
export { useCardFlip, usePrefersReducedMotion } from './hooks';
export { useContainerSize } from './hooks';
export { useDragSensors, useHapticFeedback } from './hooks';
export type {
  UseCardFlipOptions,
  UseCardFlipReturn,
  SpringPresetOrCustom,
  ContainerSize,
  HapticFeedback,
} from './hooks';

// DnD types
export type {
  DragItemData,
  DropValidationFn,
  DragLifecycleCallbacks,
  SensorConfig,
  DragPreviewMode,
  DropFeedbackMode,
  InvalidDropBehavior,
} from './types';

// State management (Phase 4)
export { gameReducer } from './state';
export { createInitialState } from './state';
export {
  dealStandardDeck,
  shuffleLocation,
  moveCard as moveCardAction,
  flipCard as flipCardAction,
  selectCard as selectCardAction,
  setGamePhase,
  setCurrentPlayer,
  reset as resetAction,
} from './state';
export {
  selectAllLocations,
  selectLocation as selectLocationState,
  selectCardState,
  selectGamePhase as selectGamePhaseState,
  selectCurrentPlayer as selectCurrentPlayerState,
  selectLocationCount,
} from './state';
export type {
  GameState,
  CardState,
  GameAction,
  MoveCardPayload,
  FlipCardPayload,
  SelectCardPayload,
  SetLocationsPayload,
  DealCardsPayload,
} from './state';

// Context mode provider (Phase 4)
export { GameProvider } from './context';
export type { GameProviderProps } from './context';
export { loadState, saveState, clearState } from './context';

// Hooks (Phase 4 - state management)
export { useGameState, useLocation, useCard, useGameActions } from './hooks';
export { useStateBackend, StateBackendContext } from './hooks';
export type { StateBackend, GameDispatchFn } from './hooks';

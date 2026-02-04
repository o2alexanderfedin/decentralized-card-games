/**
 * Component prop types for Card, CardFace, and CardBack components.
 *
 * Supports controlled and uncontrolled card modes, multiple color schemes,
 * configurable aspect ratios, and spring animation presets.
 */

import { ReactNode } from 'react';
import { CardData } from '../../types';
import type { ColorScheme } from '../../constants';

/** Card aspect ratio presets matching standard card dimensions. */
export type AspectRatio = 'poker' | 'bridge';

/** 3D perspective depth for card transforms. */
export type Perspective = 'subtle' | 'moderate' | 'dramatic';

/** Spring animation preset names. */
export type SpringPreset = 'default' | 'bouncy' | 'stiff';

/** Data provided in card click callbacks. */
export interface CardClickData extends CardData {
  /** Whether the card is currently face up. */
  isFaceUp: boolean;
}

/** Props for the Card component. */
export interface CardProps {
  /** Card identity in notation format (e.g., "♠A") or CardData object. */
  card: string | CardData;

  /** Controlled mode: explicitly set face-up state. */
  isFaceUp?: boolean;

  /** Color scheme for suits. Defaults to 'two-color'. */
  colorScheme?: ColorScheme;

  /** Card aspect ratio. Defaults to 'poker'. */
  aspectRatio?: AspectRatio;

  /** 3D perspective depth. Defaults to 'moderate'. */
  perspective?: Perspective;

  /** Spring animation preset or custom config. */
  spring?: SpringPreset | { stiffness: number; damping: number };

  /** Custom card back content. */
  cardBack?: ReactNode;

  /** Called when card is clicked/tapped. */
  onClick?: (data: CardClickData) => void;

  /** Called when flip animation starts. */
  onFlipStart?: () => void;

  /** Called when flip animation completes. */
  onFlipComplete?: () => void;

  /** Called on hover state change. */
  onHover?: (isHovered: boolean) => void;

  /** Called on focus state change. */
  onFocus?: (isFocused: boolean) => void;

  /** Additional CSS class. */
  className?: string;

  /** Inline styles for the card container. */
  style?: React.CSSProperties;
}

/** Imperative handle exposed via ref for uncontrolled Card. */
export interface CardRef {
  /** Flip the card (uncontrolled mode only). */
  flip: () => void;
  /** Get current face-up state. */
  isFaceUp: () => boolean;
}

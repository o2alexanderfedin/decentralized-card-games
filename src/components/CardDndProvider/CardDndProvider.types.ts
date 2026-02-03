/**
 * Type definitions for the CardDndProvider component.
 *
 * CardDndProvider assembles DndContext, sensors, drag overlay,
 * and lifecycle management into a single provider component.
 *
 * @module CardDndProvider
 */

import type { ReactNode } from 'react';
import type { CollisionDetection } from '@dnd-kit/core';
import type {
  CardData,
  SensorConfig,
  DragPreviewMode,
  InvalidDropBehavior,
} from '../../types';

/**
 * Props for the {@link CardDndProvider} component.
 *
 * Wraps dnd-kit's DndContext with pre-configured sensors,
 * card-specific lifecycle callbacks, haptic feedback,
 * and multi-card selection support.
 */
export interface CardDndProviderProps {
  /** Game board content (draggable cards, drop zones, etc.). */
  children: ReactNode;
  /** Called when a drag operation starts. */
  onDragStart?: (card: CardData, sourceZoneId?: string) => void;
  /** Called when a dragged item moves over a droppable zone. */
  onDragOver?: (card: CardData, overZoneId: string) => void;
  /** Called when a drag ends (drop or outside). */
  onDragEnd?: (card: CardData, targetZoneId: string | null, sourceZoneId?: string) => void;
  /** Called when a drag operation is cancelled. */
  onDragCancel?: () => void;
  /** Called when a drop is rejected by zone validation. */
  onDropReject?: (card: CardData, targetZoneId: string) => void;
  /** Collision detection algorithm. Default: `closestCorners`. */
  collisionDetection?: CollisionDetection;
  /** Enable auto-scrolling during drag. Default: `false`. */
  autoScroll?: boolean;
  /** Custom sensor activation thresholds. */
  sensorConfig?: SensorConfig;
  /** Enable haptic feedback on supported devices. Default: `false`. */
  hapticFeedback?: boolean;
  /** How the drag overlay displays the card. Default: `'original'`. */
  previewMode?: DragPreviewMode;
  /** Externally controlled multi-card selection. */
  selectedCards?: CardData[];
  /** What happens on invalid drop. Default: `'snap-back'`. */
  invalidDropBehavior?: InvalidDropBehavior;
}

/**
 * Type definitions for drag-and-drop interactions.
 *
 * Provides type-safe interfaces for drag data, drop validation,
 * sensor configuration, drag lifecycle events, and visual modes.
 *
 * @module dnd
 */

import type { CardData } from './card';
import type { CollisionDetection } from '@dnd-kit/core';

// Re-export dnd-kit event types for consumer convenience
export type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  DragCancelEvent,
} from '@dnd-kit/core';

/**
 * Data attached to a draggable card via useDraggable's `data` prop.
 *
 * This is the payload consumers receive in drag lifecycle callbacks
 * via `event.active.data.current`.
 */
export interface DragItemData {
  /** The card being dragged. */
  card: CardData;
  /** Discriminator for drag item type. */
  type: 'card';
  /** ID of the zone the card was dragged from (if any). */
  sourceZoneId?: string;
}

/**
 * Callback for validating whether a card can be dropped on a zone.
 *
 * @param card - The card being evaluated for drop acceptance
 * @returns true if the drop is allowed, false otherwise
 */
export type DropValidationFn = (card: CardData) => boolean;

/**
 * Lifecycle callbacks for drag-and-drop events.
 *
 * All callbacks are optional. Consumers attach the ones they need
 * to the CardDndProvider.
 */
export interface DragLifecycleCallbacks {
  /** Called when a drag operation starts. */
  onDragStart?: (event: import('@dnd-kit/core').DragStartEvent) => void;
  /** Called when a dragged item moves over a droppable zone. */
  onDragOver?: (event: import('@dnd-kit/core').DragOverEvent) => void;
  /** Called when a drag ends with a successful drop. */
  onDrop?: (event: import('@dnd-kit/core').DragEndEvent) => void;
  /** Called when a drop is rejected (validation failed). */
  onDropReject?: (event: import('@dnd-kit/core').DragEndEvent) => void;
  /** Called when a drag operation is cancelled. */
  onDragCancel?: (event: import('@dnd-kit/core').DragCancelEvent) => void;
}

/**
 * Configuration for drag sensor activation thresholds.
 *
 * All fields are optional; defaults are applied by useDragSensors.
 */
export interface SensorConfig {
  /**
   * Distance in pixels the mouse must move before drag activates.
   * @default 5
   */
  mouseDistance?: number;
  /**
   * Delay in milliseconds before touch drag activates (long-press).
   * @default 200
   */
  touchDelay?: number;
  /**
   * Tolerance in pixels for finger movement during touch delay.
   * @default 8
   */
  touchTolerance?: number;
}

/** How the drag overlay displays the dragged card. */
export type DragPreviewMode = 'original' | 'translucent' | 'miniature';

/** How drop zones visually indicate they accept the dragged card. */
export type DropFeedbackMode = 'highlight' | 'pulse' | 'outline';

/** What happens when a card is dropped on an invalid target. */
export type InvalidDropBehavior = 'snap-back' | 'reject-snap' | 'stay';

/**
 * Props for the CardDndProvider component.
 *
 * Wraps dnd-kit's DndContext with pre-configured sensors
 * and card-specific lifecycle callbacks.
 */
export interface CardDndProviderProps extends DragLifecycleCallbacks {
  /** Child components (draggable cards, drop zones, etc.) */
  children: React.ReactNode;
  /** Collision detection algorithm. Defaults to closestCorners. */
  collisionDetection?: CollisionDetection;
  /** Enable auto-scrolling during drag. Defaults to false for card games. */
  autoScroll?: boolean;
  /** Custom sensor activation thresholds. */
  sensorConfig?: SensorConfig;
  /** Enable haptic feedback on supported devices. */
  hapticFeedback?: boolean;
}

/**
 * CardDndProvider component -- top-level drag-and-drop context for card games.
 *
 * Assembles dnd-kit's DndContext with pre-configured sensors,
 * CardDragOverlay, lifecycle callbacks, haptic feedback,
 * and multi-card selection into a single provider component.
 *
 * Developers wrap their game board in this component to enable
 * drag-and-drop card interactions.
 *
 * @module CardDndProvider
 */

import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { useDragSensors } from '../../hooks';
import { useHapticFeedback } from '../../hooks';
import { CardDragOverlay } from '../CardDragOverlay';
import type { DragItemData, DropValidationFn } from '../../types';
import type { CardData } from '../../types';
import type { CardDndProviderProps } from './CardDndProvider.types';

/**
 * CardDndProvider wraps children in DndContext with configured sensors,
 * drag overlay, haptic feedback, and lifecycle callbacks.
 *
 * @example
 * ```tsx
 * <CardDndProvider
 *   onDragEnd={(card, targetId) => moveCard(card, targetId)}
 *   hapticFeedback
 * >
 *   <DroppableZone id="hand">
 *     {cards.map(c => <DraggableCard key={formatCard(c)} card={c} />)}
 *   </DroppableZone>
 *   <DroppableZone id="discard" />
 * </CardDndProvider>
 * ```
 *
 * @see {@link CardDndProviderProps} for all available props
 */
export const CardDndProvider: React.FC<CardDndProviderProps> = ({
  children,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragCancel,
  onDropReject,
  collisionDetection,
  autoScroll,
  sensorConfig,
  hapticFeedback: hapticEnabled = false,
  previewMode,
  selectedCards,
  // invalidDropBehavior reserved for future animation support
}) => {
  // ---------------------------------------------------------------------------
  // Sensors
  // ---------------------------------------------------------------------------
  const sensors = useDragSensors(sensorConfig);

  // ---------------------------------------------------------------------------
  // Haptic feedback
  // ---------------------------------------------------------------------------
  const haptic = useHapticFeedback(hapticEnabled);

  // ---------------------------------------------------------------------------
  // Active card state
  // ---------------------------------------------------------------------------
  const [activeCard, setActiveCard] = useState<CardData | null>(null);
  const [activeSourceZoneId, setActiveSourceZoneId] = useState<
    string | undefined
  >(undefined);

  // ---------------------------------------------------------------------------
  // Lifecycle handlers
  // ---------------------------------------------------------------------------

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current as DragItemData | undefined;
      const card = data?.card;
      const sourceZoneId = data?.sourceZoneId;

      if (card) {
        setActiveCard(card);
        setActiveSourceZoneId(sourceZoneId);
        haptic.onPickup();
        onDragStart?.(card, sourceZoneId);
      }
    },
    [haptic, onDragStart],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      if (event.over && activeCard) {
        haptic.onHover();
        onDragOver?.(activeCard, String(event.over.id));
      }
    },
    [haptic, onDragOver, activeCard],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const card = activeCard;

      if (!card) {
        setActiveCard(null);
        setActiveSourceZoneId(undefined);
        return;
      }

      const targetId = event.over ? String(event.over.id) : null;

      if (targetId !== null && event.over) {
        // Check drop validation from zone data
        const zoneData = event.over.data.current as
          | { accepts?: string[]; onValidate?: DropValidationFn }
          | undefined;

        let isValid = true;

        if (zoneData?.onValidate) {
          isValid = zoneData.onValidate(card);
        } else if (zoneData?.accepts) {
          isValid = zoneData.accepts.includes('card');
        }

        if (isValid) {
          haptic.onDrop();
          onDragEnd?.(card, targetId, activeSourceZoneId);
        } else {
          haptic.onReject();
          onDropReject?.(card, targetId);
        }
      } else {
        // Dropped outside any zone
        onDragEnd?.(card, null, activeSourceZoneId);
      }

      setActiveCard(null);
      setActiveSourceZoneId(undefined);
    },
    [activeCard, activeSourceZoneId, haptic, onDragEnd, onDropReject],
  );

  const handleDragCancel = useCallback(() => {
    setActiveCard(null);
    setActiveSourceZoneId(undefined);
    onDragCancel?.();
  }, [onDragCancel]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection ?? closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      autoScroll={autoScroll ?? false}
    >
      {children}
      <CardDragOverlay
        activeCard={activeCard}
        selectedCards={selectedCards}
        previewMode={previewMode}
      />
    </DndContext>
  );
};

CardDndProvider.displayName = 'CardDndProvider';

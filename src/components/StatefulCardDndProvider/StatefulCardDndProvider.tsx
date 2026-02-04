/**
 * StatefulCardDndProvider -- bridges Phase 3 DnD with Phase 4 state management.
 *
 * Wraps CardDndProvider and intercepts DnD lifecycle events to automatically
 * dispatch state actions (MOVE_CARD). Developers use this as a drop-in
 * replacement for CardDndProvider to get automatic state synchronization.
 *
 * Works transparently with both GameProvider (context mode) and
 * ReduxGameProvider (Redux mode) via the unified hook API.
 *
 * @module StatefulCardDndProvider
 */

import { useCallback } from 'react';
import { CardDndProvider } from '../CardDndProvider';
import { useGameActions } from '../../hooks/useGameActions';
import { useGameState } from '../../hooks/useGameState';
import type { CardData } from '../../types';
import type { StatefulCardDndProviderProps } from './StatefulCardDndProvider.types';

/**
 * CardDndProvider wrapper that auto-dispatches MOVE_CARD on drag-end.
 *
 * When a card is dragged from one zone to another, this component
 * automatically dispatches MOVE_CARD to the active state backend.
 * The developer's custom onDragEnd callback, if provided, is still
 * called after the auto-dispatch.
 *
 * @example
 * ```tsx
 * <GameProvider>
 *   <StatefulCardDndProvider>
 *     <DroppableZone id="deck">
 *       {deckCards.map(c => <DraggableCard key={formatCard(c)} card={c} />)}
 *     </DroppableZone>
 *     <DroppableZone id="hand">
 *       {handCards.map(c => <DraggableCard key={formatCard(c)} card={c} />)}
 *     </DroppableZone>
 *   </StatefulCardDndProvider>
 * </GameProvider>
 * ```
 *
 * @see {@link StatefulCardDndProviderProps} for all available props
 */
export const StatefulCardDndProvider: React.FC<StatefulCardDndProviderProps> = ({
  autoDispatch = true,
  onDragStart: userOnDragStart,
  onDragEnd: userOnDragEnd,
  ...rest
}) => {
  const dispatch = useGameActions();
  const state = useGameState();

  const handleDragStart = useCallback(
    (card: CardData, sourceZoneId?: string) => {
      userOnDragStart?.(card, sourceZoneId);
    },
    [userOnDragStart],
  );

  const handleDragEnd = useCallback(
    (card: CardData, targetZoneId: string | null, sourceZoneId?: string) => {
      // Auto-dispatch MOVE_CARD if conditions are met
      if (
        autoDispatch &&
        targetZoneId !== null &&
        sourceZoneId !== undefined &&
        targetZoneId !== sourceZoneId
      ) {
        // Find the card index in the source location by matching suit + rank
        const sourceCards = state.locations[sourceZoneId];
        if (sourceCards) {
          const cardIndex = sourceCards.findIndex(
            (c) => c.suit === card.suit && c.rank === card.rank,
          );
          if (cardIndex !== -1) {
            dispatch('MOVE_CARD', {
              cardIndex,
              from: sourceZoneId,
              to: targetZoneId,
            } as unknown as Record<string, unknown>);
          }
        }
      }

      // Always call user's onDragEnd if provided
      userOnDragEnd?.(card, targetZoneId, sourceZoneId);
    },
    [autoDispatch, dispatch, state, userOnDragEnd],
  );

  return (
    <CardDndProvider
      {...rest}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    />
  );
};

StatefulCardDndProvider.displayName = 'StatefulCardDndProvider';

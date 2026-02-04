/**
 * Roving tabindex hook for composite widget keyboard navigation.
 *
 * Implements the WAI-ARIA roving tabindex pattern: only one item in a
 * group has tabIndex={0} at a time. Arrow keys move the active index
 * between items, wrapping at boundaries. Home/End jump to first/last.
 *
 * The consuming component is responsible for calling `.focus()` on the
 * element at the new activeIndex -- this hook does not manage DOM focus
 * directly, keeping it reusable across different component structures.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex
 */

import { useState, useCallback, useEffect } from 'react';

/** Return type for the useRovingTabIndex hook. */
export interface UseRovingTabIndexReturn {
  /** The currently active (focusable) item index. */
  activeIndex: number;
  /** Manually set the active index. */
  setActiveIndex: (index: number) => void;
  /** Returns 0 for the active index, -1 for all others. */
  getTabIndex: (index: number) => 0 | -1;
  /** Keyboard event handler to attach to each item. */
  handleKeyDown: (event: React.KeyboardEvent, index: number) => void;
}

/**
 * Hook for roving tabindex keyboard navigation within a composite widget.
 *
 * @param itemCount - Total number of navigable items in the container
 * @returns Object with activeIndex, setActiveIndex, getTabIndex, handleKeyDown
 *
 * @example
 * ```tsx
 * const { activeIndex, getTabIndex, handleKeyDown } = useRovingTabIndex(cards.length);
 *
 * return cards.map((card, i) => (
 *   <div
 *     key={i}
 *     tabIndex={getTabIndex(i)}
 *     onKeyDown={(e) => handleKeyDown(e, i)}
 *     ref={(el) => { if (i === activeIndex) el?.focus(); }}
 *   >
 *     {card}
 *   </div>
 * ));
 * ```
 */
export function useRovingTabIndex(itemCount: number): UseRovingTabIndexReturn {
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset activeIndex if it exceeds the new itemCount (handles card removal)
  useEffect(() => {
    if (itemCount > 0 && activeIndex >= itemCount) {
      setActiveIndex(0);
    }
  }, [itemCount, activeIndex]);

  const getTabIndex = useCallback(
    (index: number): 0 | -1 => (index === activeIndex ? 0 : -1),
    [activeIndex],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (itemCount === 0) return;

      let nextIndex = index;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = (index + 1) % itemCount;
          event.preventDefault();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = (index - 1 + itemCount) % itemCount;
          event.preventDefault();
          break;
        case 'Home':
          nextIndex = 0;
          event.preventDefault();
          break;
        case 'End':
          nextIndex = itemCount - 1;
          event.preventDefault();
          break;
        default:
          return;
      }

      if (nextIndex !== index) {
        setActiveIndex(nextIndex);
      }
    },
    [itemCount],
  );

  return { activeIndex, setActiveIndex, getTabIndex, handleKeyDown };
}

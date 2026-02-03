/**
 * Hook that provides haptic (vibration) feedback for drag-and-drop events.
 *
 * Feature-detects the Web Vibration API and provides safe no-op callbacks
 * when vibration is not supported (e.g., iOS Safari, SSR).
 *
 * @module useHapticFeedback
 */

import { useMemo } from 'react';

/** Return type of useHapticFeedback. */
export interface HapticFeedback {
  /** Whether the device supports vibration. */
  isSupported: boolean;
  /** Short vibration for picking up a card (50ms). */
  onPickup: () => void;
  /** Brief vibration for hovering over a valid drop zone (20ms). */
  onHover: () => void;
  /** Double-pulse vibration for successful drop ([30, 20, 30]ms). */
  onDrop: () => void;
  /** Double-pulse vibration for rejected drop ([50, 30, 50]ms). */
  onReject: () => void;
}

/** No-op callback for when haptic feedback is disabled or unsupported. */
const noop = () => {};

/**
 * Provides haptic feedback callbacks with feature detection.
 *
 * @param enabled - Whether haptic feedback is enabled (default: true)
 * @returns Object with `isSupported` flag and event-specific vibration callbacks
 *
 * @example
 * ```tsx
 * function DraggableCard() {
 *   const haptics = useHapticFeedback();
 *
 *   const handleDragStart = () => {
 *     haptics.onPickup();
 *   };
 *
 *   return <Card onDragStart={handleDragStart} />;
 * }
 * ```
 */
export function useHapticFeedback(enabled: boolean = true): HapticFeedback {
  const isSupported =
    typeof navigator !== 'undefined' && 'vibrate' in navigator;

  return useMemo(() => {
    if (!enabled || !isSupported) {
      return {
        isSupported,
        onPickup: noop,
        onHover: noop,
        onDrop: noop,
        onReject: noop,
      };
    }

    return {
      isSupported,
      onPickup: () => navigator.vibrate(50),
      onHover: () => navigator.vibrate(20),
      onDrop: () => navigator.vibrate([30, 20, 30]),
      onReject: () => navigator.vibrate([50, 30, 50]),
    };
  }, [enabled, isSupported]);
}

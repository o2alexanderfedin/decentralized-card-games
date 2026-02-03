/**
 * Hook that configures drag-and-drop sensors for card interactions.
 *
 * Returns a combined sensor array with MouseSensor, TouchSensor, and
 * KeyboardSensor, each with configurable activation thresholds.
 *
 * Uses separate Mouse + Touch sensors (not PointerSensor) for reliable
 * cross-platform behavior, especially on iOS Safari where PointerSensor
 * cannot prevent scroll via JavaScript event listeners.
 *
 * @module useDragSensors
 */

import {
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import type { SensorConfig } from '../types';

/**
 * Configure drag sensors with optional custom activation thresholds.
 *
 * @param config - Optional sensor configuration overrides
 * @returns Combined sensor array for use with DndContext's `sensors` prop
 *
 * @example
 * ```tsx
 * function GameBoard({ children }) {
 *   const sensors = useDragSensors();
 *   return <DndContext sensors={sensors}>{children}</DndContext>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Custom thresholds for more deliberate activation
 * const sensors = useDragSensors({
 *   mouseDistance: 10,
 *   touchDelay: 300,
 *   touchTolerance: 12,
 * });
 * ```
 */
export function useDragSensors(config?: SensorConfig) {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: config?.mouseDistance ?? 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: config?.touchDelay ?? 200,
      tolerance: config?.touchTolerance ?? 8,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor);

  return useSensors(mouseSensor, touchSensor, keyboardSensor);
}

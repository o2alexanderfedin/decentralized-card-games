/**
 * Game-level keyboard shortcut registry hook.
 *
 * Registers document-level keydown listeners for game shortcuts
 * (e.g. D for draw, P for play, F to flip). Shortcuts are
 * suppressed when focus is in text inputs or when modifier keys
 * are held, preventing conflicts with browser/OS shortcuts.
 */

import { useEffect, useCallback } from 'react';

/** A registered keyboard shortcut definition. */
export interface KeyboardShortcut {
  /** The key to listen for (single character, e.g. 'D', 'P', 'F'). */
  key: string;
  /** Callback to invoke when the shortcut fires. */
  action: () => void;
  /** Human-readable description for help overlays / documentation. */
  label: string;
  /** Whether the shortcut is active. Defaults to true. */
  enabled?: boolean;
}

/**
 * Hook that registers document-level keyboard shortcuts.
 *
 * Guard conditions (shortcut will NOT fire when):
 * - A modifier key (Ctrl, Meta, Alt) is held
 * - Focus is inside an INPUT, TEXTAREA, or contentEditable element
 * - The shortcut is disabled (`enabled: false`)
 *
 * @param shortcuts - Array of shortcut definitions to register
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   { key: 'D', action: drawCard, label: 'Draw a card' },
 *   { key: 'P', action: playCard, label: 'Play selected card' },
 *   { key: 'F', action: flipCard, label: 'Flip card', enabled: hasSelectedCard },
 * ]);
 * ```
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void {
  const handler = useCallback(
    (event: KeyboardEvent) => {
      // Suppress when modifier keys are held
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      // Suppress when focus is in a text input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      const shortcut = shortcuts.find(
        (s) =>
          s.key.toUpperCase() === event.key.toUpperCase() &&
          s.enabled !== false,
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    },
    [shortcuts],
  );

  useEffect(() => {
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handler]);
}

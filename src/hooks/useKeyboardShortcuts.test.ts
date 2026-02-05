import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import type { KeyboardShortcut } from './useKeyboardShortcuts';

/** Fire a keydown event on the document. */
function fireKey(
  key: string,
  options: Partial<KeyboardEventInit> = {},
  target?: HTMLElement,
): void {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  (target ?? document).dispatchEvent(event);
}

afterEach(() => {
  cleanup();
});

describe('useKeyboardShortcuts', () => {
  it('fires action on matching key press', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'D', action, label: 'Draw card' },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    act(() => fireKey('d'));
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('matches case-insensitively', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'p', action, label: 'Play card' },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    act(() => fireKey('P'));
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('does not fire for non-matching keys', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      { key: 'D', action, label: 'Draw card' },
    ];

    renderHook(() => useKeyboardShortcuts(shortcuts));

    act(() => fireKey('x'));
    expect(action).not.toHaveBeenCalled();
  });

  describe('modifier key suppression', () => {
    it('suppresses when Ctrl is held', () => {
      const action = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'D', action, label: 'Draw' }]),
      );

      act(() => fireKey('d', { ctrlKey: true }));
      expect(action).not.toHaveBeenCalled();
    });

    it('suppresses when Meta is held', () => {
      const action = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'D', action, label: 'Draw' }]),
      );

      act(() => fireKey('d', { metaKey: true }));
      expect(action).not.toHaveBeenCalled();
    });

    it('suppresses when Alt is held', () => {
      const action = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'D', action, label: 'Draw' }]),
      );

      act(() => fireKey('d', { altKey: true }));
      expect(action).not.toHaveBeenCalled();
    });
  });

  describe('input field suppression', () => {
    it('suppresses when focus is in INPUT', () => {
      const action = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'D', action, label: 'Draw' }]),
      );

      const input = document.createElement('input');
      document.body.appendChild(input);
      try {
        act(() => fireKey('d', {}, input));
        expect(action).not.toHaveBeenCalled();
      } finally {
        document.body.removeChild(input);
      }
    });

    it('suppresses when focus is in TEXTAREA', () => {
      const action = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'D', action, label: 'Draw' }]),
      );

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      try {
        act(() => fireKey('d', {}, textarea));
        expect(action).not.toHaveBeenCalled();
      } finally {
        document.body.removeChild(textarea);
      }
    });

    it('suppresses when target is contentEditable', () => {
      const action = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'D', action, label: 'Draw' }]),
      );

      const div = document.createElement('div');
      div.contentEditable = 'true';
      document.body.appendChild(div);
      try {
        act(() => fireKey('d', {}, div));
        expect(action).not.toHaveBeenCalled();
      } finally {
        document.body.removeChild(div);
      }
    });
  });

  describe('enabled flag', () => {
    it('does not fire disabled shortcuts', () => {
      const action = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([
          { key: 'D', action, label: 'Draw', enabled: false },
        ]),
      );

      act(() => fireKey('d'));
      expect(action).not.toHaveBeenCalled();
    });

    it('fires shortcuts with enabled=true', () => {
      const action = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([
          { key: 'D', action, label: 'Draw', enabled: true },
        ]),
      );

      act(() => fireKey('d'));
      expect(action).toHaveBeenCalledTimes(1);
    });

    it('fires shortcuts with enabled omitted (defaults to active)', () => {
      const action = vi.fn();
      renderHook(() =>
        useKeyboardShortcuts([{ key: 'D', action, label: 'Draw' }]),
      );

      act(() => fireKey('d'));
      expect(action).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    it('removes listener on unmount', () => {
      const action = vi.fn();
      const { unmount } = renderHook(() =>
        useKeyboardShortcuts([{ key: 'D', action, label: 'Draw' }]),
      );

      unmount();

      act(() => fireKey('d'));
      expect(action).not.toHaveBeenCalled();
    });
  });

  describe('multiple shortcuts', () => {
    it('fires the correct action for each key', () => {
      const drawAction = vi.fn();
      const playAction = vi.fn();

      renderHook(() =>
        useKeyboardShortcuts([
          { key: 'D', action: drawAction, label: 'Draw' },
          { key: 'P', action: playAction, label: 'Play' },
        ]),
      );

      act(() => fireKey('d'));
      act(() => fireKey('p'));

      expect(drawAction).toHaveBeenCalledTimes(1);
      expect(playAction).toHaveBeenCalledTimes(1);
    });
  });
});

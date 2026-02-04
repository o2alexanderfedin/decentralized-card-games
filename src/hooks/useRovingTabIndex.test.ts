import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRovingTabIndex } from './useRovingTabIndex';
import type React from 'react';

/** Helper to create a synthetic keyboard event. */
function makeKeyEvent(key: string): React.KeyboardEvent {
  return {
    key,
    preventDefault: vi.fn(),
  } as unknown as React.KeyboardEvent;
}

describe('useRovingTabIndex', () => {
  it('initializes activeIndex to 0', () => {
    const { result } = renderHook(() => useRovingTabIndex(5));
    expect(result.current.activeIndex).toBe(0);
  });

  describe('getTabIndex', () => {
    it('returns 0 for activeIndex', () => {
      const { result } = renderHook(() => useRovingTabIndex(5));
      expect(result.current.getTabIndex(0)).toBe(0);
    });

    it('returns -1 for non-active indices', () => {
      const { result } = renderHook(() => useRovingTabIndex(5));
      expect(result.current.getTabIndex(1)).toBe(-1);
      expect(result.current.getTabIndex(2)).toBe(-1);
      expect(result.current.getTabIndex(4)).toBe(-1);
    });

    it('updates after setActiveIndex', () => {
      const { result } = renderHook(() => useRovingTabIndex(5));
      act(() => result.current.setActiveIndex(3));
      expect(result.current.getTabIndex(3)).toBe(0);
      expect(result.current.getTabIndex(0)).toBe(-1);
    });
  });

  describe('ArrowRight / ArrowDown navigation', () => {
    it('moves to next index', () => {
      const { result } = renderHook(() => useRovingTabIndex(5));
      const event = makeKeyEvent('ArrowRight');

      act(() => result.current.handleKeyDown(event, 0));

      expect(result.current.activeIndex).toBe(1);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('wraps from last to first', () => {
      const { result } = renderHook(() => useRovingTabIndex(3));
      act(() => result.current.setActiveIndex(2));

      const event = makeKeyEvent('ArrowDown');
      act(() => result.current.handleKeyDown(event, 2));

      expect(result.current.activeIndex).toBe(0);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('ArrowLeft / ArrowUp navigation', () => {
    it('moves to previous index', () => {
      const { result } = renderHook(() => useRovingTabIndex(5));
      act(() => result.current.setActiveIndex(3));

      const event = makeKeyEvent('ArrowLeft');
      act(() => result.current.handleKeyDown(event, 3));

      expect(result.current.activeIndex).toBe(2);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('wraps from first to last', () => {
      const { result } = renderHook(() => useRovingTabIndex(4));

      const event = makeKeyEvent('ArrowUp');
      act(() => result.current.handleKeyDown(event, 0));

      expect(result.current.activeIndex).toBe(3);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Home / End navigation', () => {
    it('Home jumps to index 0', () => {
      const { result } = renderHook(() => useRovingTabIndex(5));
      act(() => result.current.setActiveIndex(4));

      const event = makeKeyEvent('Home');
      act(() => result.current.handleKeyDown(event, 4));

      expect(result.current.activeIndex).toBe(0);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('End jumps to last index', () => {
      const { result } = renderHook(() => useRovingTabIndex(5));

      const event = makeKeyEvent('End');
      act(() => result.current.handleKeyDown(event, 0));

      expect(result.current.activeIndex).toBe(4);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('unrecognized keys', () => {
    it('does not call preventDefault for unrecognized keys', () => {
      const { result } = renderHook(() => useRovingTabIndex(5));
      const event = makeKeyEvent('Enter');

      act(() => result.current.handleKeyDown(event, 0));

      expect(result.current.activeIndex).toBe(0);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('itemCount boundary handling', () => {
    it('resets activeIndex when itemCount shrinks below it', () => {
      const { result, rerender } = renderHook(
        ({ count }) => useRovingTabIndex(count),
        { initialProps: { count: 5 } },
      );

      act(() => result.current.setActiveIndex(4));
      expect(result.current.activeIndex).toBe(4);

      rerender({ count: 3 });
      expect(result.current.activeIndex).toBe(0);
    });

    it('handles single item', () => {
      const { result } = renderHook(() => useRovingTabIndex(1));
      expect(result.current.getTabIndex(0)).toBe(0);

      // ArrowRight wraps to same item
      const event = makeKeyEvent('ArrowRight');
      act(() => result.current.handleKeyDown(event, 0));
      expect(result.current.activeIndex).toBe(0);
    });

    it('handles zero items without error', () => {
      const { result } = renderHook(() => useRovingTabIndex(0));
      const event = makeKeyEvent('ArrowRight');

      act(() => result.current.handleKeyDown(event, 0));
      expect(result.current.activeIndex).toBe(0);
    });
  });
});

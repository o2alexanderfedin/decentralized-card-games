import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

describe('usePrefersReducedMotion', () => {
  let matchMediaSpy: ReturnType<typeof vi.spyOn>;
  let listeners: Map<string, (event: MediaQueryListEvent) => void>;

  /** Helper to create a mock MediaQueryList. */
  function createMockMediaQueryList(matches: boolean): MediaQueryList {
    listeners = new Map();
    return {
      matches,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn((event: string, handler: EventListener) => {
        listeners.set(event, handler as (event: MediaQueryListEvent) => void);
      }),
      removeEventListener: vi.fn((event: string) => {
        listeners.delete(event);
      }),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  }

  beforeEach(() => {
    matchMediaSpy = vi.spyOn(window, 'matchMedia');
  });

  afterEach(() => {
    matchMediaSpy.mockRestore();
  });

  it('returns false when system does not prefer reduced motion', () => {
    matchMediaSpy.mockReturnValue(createMockMediaQueryList(false));

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when system prefers reduced motion', () => {
    matchMediaSpy.mockReturnValue(createMockMediaQueryList(true));

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('updates when system preference changes', () => {
    const mql = createMockMediaQueryList(false);
    matchMediaSpy.mockReturnValue(mql);

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);

    // Simulate the system preference changing
    act(() => {
      const changeHandler = listeners.get('change');
      expect(changeHandler).toBeDefined();
      changeHandler!({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });

  it('cleans up event listener on unmount', () => {
    const mql = createMockMediaQueryList(false);
    matchMediaSpy.mockReturnValue(mql);

    const { unmount } = renderHook(() => usePrefersReducedMotion());

    expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    unmount();

    expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('returns a boolean type', () => {
    matchMediaSpy.mockReturnValue(createMockMediaQueryList(false));

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(typeof result.current).toBe('boolean');
  });
});

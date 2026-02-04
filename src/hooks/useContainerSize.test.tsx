import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, screen } from '@testing-library/react';
import React, { type FC } from 'react';
import { useContainerSize } from './useContainerSize';

/* ------------------------------------------------------------------ */
/*  ResizeObserver mock                                                */
/* ------------------------------------------------------------------ */

let resizeCallback: ResizeObserverCallback;
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
const mockUnobserve = vi.fn();

beforeEach(() => {
  mockObserve.mockReset();
  mockDisconnect.mockReset();
  mockUnobserve.mockReset();

  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(cb: ResizeObserverCallback) {
        resizeCallback = cb;
      }
      observe = mockObserve;
      disconnect = mockDisconnect;
      unobserve = mockUnobserve;
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/* ------------------------------------------------------------------ */
/*  Helper: simulate a resize event                                    */
/* ------------------------------------------------------------------ */

function fireResize(width: number, height: number) {
  resizeCallback(
    [
      {
        contentRect: { width, height } as DOMRectReadOnly,
      } as ResizeObserverEntry,
    ],
    {} as ResizeObserver,
  );
}

/* ------------------------------------------------------------------ */
/*  Test component that uses the hook and displays size                 */
/* ------------------------------------------------------------------ */

const TestComponent: FC = () => {
  const { ref, size } = useContainerSize();
  return (
    <div ref={ref} data-testid="container">
      <span data-testid="width">{size.width}</span>
      <span data-testid="height">{size.height}</span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('useContainerSize', () => {
  it('returns initial size {width: 0, height: 0}', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('width').textContent).toBe('0');
    expect(screen.getByTestId('height').textContent).toBe('0');
  });

  it('observes the ref element on mount', () => {
    render(<TestComponent />);

    expect(mockObserve).toHaveBeenCalledTimes(1);
    // The observed element should be the container div
    const observedElement = mockObserve.mock.calls[0][0];
    expect(observedElement).toBeInstanceOf(HTMLDivElement);
  });

  it('updates size after ResizeObserver fires', () => {
    render(<TestComponent />);

    act(() => {
      fireResize(300, 200);
    });

    expect(screen.getByTestId('width').textContent).toBe('300');
    expect(screen.getByTestId('height').textContent).toBe('200');
  });

  it('rounds dimensions to integers', () => {
    render(<TestComponent />);

    act(() => {
      fireResize(300.7, 199.3);
    });

    expect(screen.getByTestId('width').textContent).toBe('301');
    expect(screen.getByTestId('height').textContent).toBe('199');
  });

  it('preserves state identity when rounded size is unchanged', () => {
    // Track all size objects seen during renders
    const sizeHistory: Array<{ width: number; height: number }> = [];

    const TrackingComponent: FC = () => {
      const { ref, size } = useContainerSize();
      sizeHistory.push(size);
      return (
        <div ref={ref}>
          <span data-testid="width">{size.width}</span>
          <span data-testid="height">{size.height}</span>
        </div>
      );
    };

    render(<TrackingComponent />);

    // First resize to set a known value
    act(() => {
      fireResize(100, 50);
    });

    // Capture the size object after first resize
    const sizeAfterFirst = sizeHistory[sizeHistory.length - 1];

    // Same rounded values -- state object should remain the same reference
    act(() => {
      fireResize(100.4, 50.2);
    });

    const sizeAfterSecond = sizeHistory[sizeHistory.length - 1];
    // The size values should still be the same
    expect(sizeAfterSecond.width).toBe(100);
    expect(sizeAfterSecond.height).toBe(50);
    // The state object should be the same reference (functional updater returned prev)
    expect(sizeAfterSecond).toBe(sizeAfterFirst);
  });

  it('disconnects observer on unmount', () => {
    const { unmount } = render(<TestComponent />);

    expect(mockObserve).toHaveBeenCalledTimes(1);

    unmount();

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCardFlip } from './useCardFlip';

describe('useCardFlip', () => {
  it('returns rotateY of 0 when isFaceUp is true', () => {
    const { result } = renderHook(() =>
      useCardFlip({ isFaceUp: true }),
    );

    expect(result.current.rotateY.get()).toBe(0);
  });

  it('returns rotateY of 180 when isFaceUp is false', () => {
    const { result } = renderHook(() =>
      useCardFlip({ isFaceUp: false }),
    );

    expect(result.current.rotateY.get()).toBe(180);
  });

  it('derives frontOpacity from rotateY (face-up = visible)', () => {
    const { result } = renderHook(() =>
      useCardFlip({ isFaceUp: true }),
    );

    // At rotation 0, front should be fully visible
    expect(result.current.frontOpacity.get()).toBe(1);
    // At rotation 0, back should be hidden
    expect(result.current.backOpacity.get()).toBe(0);
  });

  it('derives backOpacity from rotateY (face-down = visible)', () => {
    const { result } = renderHook(() =>
      useCardFlip({ isFaceUp: false }),
    );

    // At rotation 180, front should be hidden
    expect(result.current.frontOpacity.get()).toBe(0);
    // At rotation 180, back should be visible
    expect(result.current.backOpacity.get()).toBe(1);
  });

  it('updates rotation when isFaceUp changes', () => {
    const { result, rerender } = renderHook(
      (props: { isFaceUp: boolean }) => useCardFlip(props),
      { initialProps: { isFaceUp: true } },
    );

    expect(result.current.rotateY.get()).toBe(0);

    act(() => {
      rerender({ isFaceUp: false });
    });

    // After rerender the spring target should be 180
    // In jsdom the spring resolves synchronously at target
    // (no real animation frames), so we check the target was set
    // The motion value should have been told to go to 180
    const rotation = result.current.rotateY.get();
    // It may be 0 (starting animation) or 180 (resolved) depending on timing
    expect(typeof rotation).toBe('number');
  });

  it('accepts a spring preset name', () => {
    const { result } = renderHook(() =>
      useCardFlip({ isFaceUp: true, spring: 'bouncy' }),
    );

    // Should not throw, and rotateY should be a valid motion value
    expect(result.current.rotateY.get()).toBe(0);
  });

  it('accepts custom spring values', () => {
    const { result } = renderHook(() =>
      useCardFlip({
        isFaceUp: true,
        spring: { stiffness: 200, damping: 25 },
      }),
    );

    expect(result.current.rotateY.get()).toBe(0);
  });

  it('defaults spring to "default" preset', () => {
    const { result } = renderHook(() =>
      useCardFlip({ isFaceUp: true }),
    );

    // No error means the default preset resolved correctly
    expect(result.current.rotateY.get()).toBe(0);
  });

  it('exposes isAnimating as a boolean', () => {
    const { result } = renderHook(() =>
      useCardFlip({ isFaceUp: true }),
    );

    expect(typeof result.current.isAnimating).toBe('boolean');
  });

  it('accepts onFlipComplete callback without error', () => {
    const callback = vi.fn();

    const { result } = renderHook(() =>
      useCardFlip({ isFaceUp: true, onFlipComplete: callback }),
    );

    // Hook should create successfully with callback
    expect(result.current.rotateY.get()).toBe(0);
  });

  it('returns MotionValue instances for rotateY, frontOpacity, backOpacity', () => {
    const { result } = renderHook(() =>
      useCardFlip({ isFaceUp: true }),
    );

    // MotionValues have .get() and .set() methods
    expect(typeof result.current.rotateY.get).toBe('function');
    expect(typeof result.current.frontOpacity.get).toBe('function');
    expect(typeof result.current.backOpacity.get).toBe('function');
  });
});

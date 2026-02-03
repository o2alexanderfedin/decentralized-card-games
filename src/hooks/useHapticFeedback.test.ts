import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHapticFeedback } from './useHapticFeedback';

describe('useHapticFeedback', () => {
  describe('when vibrate API is not available (jsdom default)', () => {
    it('returns isSupported: false', () => {
      const { result } = renderHook(() => useHapticFeedback());
      expect(result.current.isSupported).toBe(false);
    });

    it('callbacks are no-ops that do not throw', () => {
      const { result } = renderHook(() => useHapticFeedback());

      expect(() => result.current.onPickup()).not.toThrow();
      expect(() => result.current.onHover()).not.toThrow();
      expect(() => result.current.onDrop()).not.toThrow();
      expect(() => result.current.onReject()).not.toThrow();
    });
  });

  describe('when enabled=false', () => {
    let mockVibrate: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockVibrate = vi.fn();
      vi.stubGlobal('navigator', {
        ...navigator,
        vibrate: mockVibrate,
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('callbacks do not invoke vibrate', () => {
      const { result } = renderHook(() => useHapticFeedback(false));

      result.current.onPickup();
      result.current.onHover();
      result.current.onDrop();
      result.current.onReject();

      expect(mockVibrate).not.toHaveBeenCalled();
    });
  });

  describe('when vibrate API is available and enabled', () => {
    let mockVibrate: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockVibrate = vi.fn();
      vi.stubGlobal('navigator', {
        ...navigator,
        vibrate: mockVibrate,
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('returns isSupported: true', () => {
      const { result } = renderHook(() => useHapticFeedback());
      expect(result.current.isSupported).toBe(true);
    });

    it('onPickup vibrates for 50ms', () => {
      const { result } = renderHook(() => useHapticFeedback());
      result.current.onPickup();
      expect(mockVibrate).toHaveBeenCalledWith(50);
    });

    it('onHover vibrates for 20ms', () => {
      const { result } = renderHook(() => useHapticFeedback());
      result.current.onHover();
      expect(mockVibrate).toHaveBeenCalledWith(20);
    });

    it('onDrop vibrates with pattern [30, 20, 30]', () => {
      const { result } = renderHook(() => useHapticFeedback());
      result.current.onDrop();
      expect(mockVibrate).toHaveBeenCalledWith([30, 20, 30]);
    });

    it('onReject vibrates with pattern [50, 30, 50]', () => {
      const { result } = renderHook(() => useHapticFeedback());
      result.current.onReject();
      expect(mockVibrate).toHaveBeenCalledWith([50, 30, 50]);
    });
  });
});

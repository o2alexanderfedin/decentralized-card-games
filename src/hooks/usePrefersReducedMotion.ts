/**
 * Hook to detect the user's system-level motion preference.
 *
 * Listens to the `prefers-reduced-motion: reduce` media query and
 * returns `true` when the user has opted to minimize non-essential
 * motion.  Card components can use this to skip or simplify
 * flip animations for users with vestibular disorders.
 *
 * SSR-safe: defaults to `false` when `window` is unavailable.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
 * @module usePrefersReducedMotion
 */

import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Returns `true` when the operating system / browser is configured
 * to prefer reduced motion.
 *
 * @example
 * ```tsx
 * const prefersReduced = usePrefersReducedMotion();
 * const spring = prefersReduced ? 'stiff' : 'bouncy';
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  // SSR-safe default: assume no preference when window is unavailable
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    // Guard for SSR / environments without matchMedia
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia(QUERY);

    // Sync in case initial state was wrong (e.g. SSR hydration)
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

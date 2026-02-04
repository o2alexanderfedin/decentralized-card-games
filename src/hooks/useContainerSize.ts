/**
 * Hook to measure a container element's dimensions via ResizeObserver.
 *
 * Returns a `ref` to attach to the container and a `size` object
 * that updates whenever the container is resized.  Dimensions are
 * rounded to whole pixels to prevent sub-pixel jitter from causing
 * unnecessary re-renders.
 *
 * @module useContainerSize
 */

import { useRef, useState, useEffect, type RefObject } from 'react';

/** Width and height of a container element in pixels. */
export interface ContainerSize {
  /** Container width in px (rounded to integer). */
  width: number;
  /** Container height in px (rounded to integer). */
  height: number;
}

/**
 * Measure a container element and re-render when its size changes.
 *
 * @typeParam T - The HTML element type of the measured container.
 * @returns An object with a `ref` to attach to the element and the
 *          current `size`.
 *
 * @example
 * ```tsx
 * function Hand() {
 *   const { ref, size } = useContainerSize();
 *   return (
 *     <div ref={ref}>
 *       Container is {size.width} x {size.height}
 *     </div>
 *   );
 * }
 * ```
 */
export function useContainerSize<
  T extends HTMLElement = HTMLDivElement,
>(): {
  ref: RefObject<T | null>;
  size: ContainerSize;
} {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const roundedWidth = Math.round(width);
        const roundedHeight = Math.round(height);

        // Only update state when dimensions actually change to prevent
        // infinite render loops (RESEARCH.md pitfall 3).
        setSize((prev) => {
          if (prev.width === roundedWidth && prev.height === roundedHeight) {
            return prev;
          }
          return { width: roundedWidth, height: roundedHeight };
        });
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, size };
}

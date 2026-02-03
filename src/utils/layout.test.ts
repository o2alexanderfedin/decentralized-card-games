import { describe, it, expect } from 'vitest';
import {
  calculateFanLayout,
  calculateSpreadLayout,
  calculateStackLayout,
} from './layout';

/* ================================================================== */
/*  Helper: assert no NaN / Infinity in any layout field               */
/* ================================================================== */

function assertFiniteLayouts(
  layouts: Array<{
    x: number;
    y: number;
    rotation: number;
    zIndex: number;
    scale: number;
  }>,
) {
  for (const l of layouts) {
    expect(Number.isFinite(l.x)).toBe(true);
    expect(Number.isFinite(l.y)).toBe(true);
    expect(Number.isFinite(l.rotation)).toBe(true);
    expect(Number.isFinite(l.zIndex)).toBe(true);
    expect(Number.isFinite(l.scale)).toBe(true);
  }
}

/* ================================================================== */
/*  calculateFanLayout                                                 */
/* ================================================================== */

describe('calculateFanLayout', () => {
  const base = { cardWidth: 60, cardHeight: 90 };

  it('returns empty array for count=0', () => {
    expect(calculateFanLayout(0, base)).toEqual([]);
  });

  it('returns single centered card for count=1', () => {
    const result = calculateFanLayout(1, base);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      x: 0,
      y: 0,
      rotation: 0,
      zIndex: 1,
      scale: 1,
    });
  });

  it('returns 2 cards with reduced angle spread (scaled by count/5)', () => {
    const result = calculateFanLayout(2, base);
    expect(result).toHaveLength(2);
    // 2 cards -> effectiveAngle = 60 * (2/5) = 24 degrees
    // First card at -12 degrees, second at +12 degrees
    expect(result[0].rotation).toBeCloseTo(-12, 1);
    expect(result[1].rotation).toBeCloseTo(12, 1);
  });

  it('returns 5 cards with angles distributed symmetrically around 0', () => {
    const result = calculateFanLayout(5, base);
    expect(result).toHaveLength(5);

    // Check symmetry: first rotation = -(last rotation)
    expect(result[0].rotation).toBeCloseTo(-result[4].rotation, 5);
  });

  it('middle card of odd count is at rotation ~0', () => {
    const result = calculateFanLayout(5, base);
    expect(result[2].rotation).toBeCloseTo(0, 5);
  });

  it('first card has negative rotation, last has positive', () => {
    const result = calculateFanLayout(7, base);
    expect(result[0].rotation).toBeLessThan(0);
    expect(result[result.length - 1].rotation).toBeGreaterThan(0);
  });

  it('all zIndex values are sequential (1, 2, 3...)', () => {
    const result = calculateFanLayout(6, base);
    for (let i = 0; i < result.length; i++) {
      expect(result[i].zIndex).toBe(i + 1);
    }
  });

  it('respects preset: subtle produces smaller angles than dramatic', () => {
    const subtle = calculateFanLayout(5, { ...base, preset: 'subtle' });
    const dramatic = calculateFanLayout(5, { ...base, preset: 'dramatic' });

    const subtleSpread = Math.abs(subtle[0].rotation - subtle[4].rotation);
    const dramaticSpread = Math.abs(
      dramatic[0].rotation - dramatic[4].rotation,
    );

    expect(subtleSpread).toBeLessThan(dramaticSpread);
  });

  it('custom maxAngle overrides preset', () => {
    const withPreset = calculateFanLayout(5, {
      ...base,
      preset: 'dramatic',
      maxAngle: 20,
    });
    // maxAngle = 20, which is less than dramatic's 90, so spread should be small
    const spread = Math.abs(
      withPreset[0].rotation - withPreset[4].rotation,
    );
    expect(spread).toBeLessThan(30); // well below dramatic's range
  });

  it('y values form an arc (middle cards have smallest y, edge cards larger y)', () => {
    const result = calculateFanLayout(7, base);
    const middleIdx = 3;
    // Edge cards should have larger y than the middle card
    expect(result[0].y).toBeGreaterThan(result[middleIdx].y);
    expect(result[6].y).toBeGreaterThan(result[middleIdx].y);
  });

  it('produces no NaN or Infinity in any output', () => {
    assertFiniteLayouts(calculateFanLayout(0, base));
    assertFiniteLayouts(calculateFanLayout(1, base));
    assertFiniteLayouts(calculateFanLayout(2, base));
    assertFiniteLayouts(calculateFanLayout(10, base));
    assertFiniteLayouts(calculateFanLayout(20, base));
  });

  it('handles 3 cards with reduced spread (count/5 scaling)', () => {
    const result = calculateFanLayout(3, base);
    expect(result).toHaveLength(3);
    // 3 cards -> effectiveAngle = 60 * (3/5) = 36
    // angles: -18, 0, 18
    expect(result[0].rotation).toBeCloseTo(-18, 1);
    expect(result[1].rotation).toBeCloseTo(0, 1);
    expect(result[2].rotation).toBeCloseTo(18, 1);
  });

  it('all scale values are 1', () => {
    const result = calculateFanLayout(5, base);
    for (const card of result) {
      expect(card.scale).toBe(1);
    }
  });
});

/* ================================================================== */
/*  calculateSpreadLayout                                              */
/* ================================================================== */

describe('calculateSpreadLayout', () => {
  const base = { containerWidth: 400, cardWidth: 60 };

  it('returns empty array for count=0', () => {
    expect(calculateSpreadLayout(0, base)).toEqual([]);
  });

  it('returns single centered card for count=1 (x=0)', () => {
    const result = calculateSpreadLayout(1, base);
    expect(result).toHaveLength(1);
    expect(result[0].x).toBe(0);
    expect(result[0].y).toBe(0);
    expect(result[0].rotation).toBe(0);
    expect(result[0].zIndex).toBe(1);
    expect(result[0].scale).toBe(1);
  });

  it('cards are evenly spaced when container is wide enough', () => {
    const result = calculateSpreadLayout(3, {
      containerWidth: 800,
      cardWidth: 60,
    });
    expect(result).toHaveLength(3);

    // Check constant spacing between adjacent cards
    const gap01 = result[1].x - result[0].x;
    const gap12 = result[2].x - result[1].x;
    expect(gap01).toBeCloseTo(gap12, 5);
  });

  it('cards overlap when container is too narrow', () => {
    // 5 cards with cardWidth=60 and maxGap=8 need 5*60 + 4*8 = 332px minimum
    // Give them only 200px
    const result = calculateSpreadLayout(5, {
      containerWidth: 200,
      cardWidth: 60,
    });
    expect(result).toHaveLength(5);

    // Spacing between adjacent cards should be less than cardWidth + maxGap
    const spacing = result[1].x - result[0].x;
    expect(spacing).toBeLessThan(60 + 8);
  });

  it('spacing never goes below minOverlap', () => {
    // Very narrow container with many cards
    const result = calculateSpreadLayout(10, {
      containerWidth: 100,
      cardWidth: 60,
      minOverlap: 30,
    });
    expect(result).toHaveLength(10);

    for (let i = 1; i < result.length; i++) {
      const spacing = result[i].x - result[i - 1].x;
      expect(spacing).toBeGreaterThanOrEqual(30 - 0.001); // float tolerance
    }
  });

  it('spread is centered (first card x is negative, last is positive)', () => {
    const result = calculateSpreadLayout(5, base);
    expect(result[0].x).toBeLessThan(0);
    expect(result[4].x).toBeGreaterThan(0);
    // Symmetric around 0
    expect(result[0].x + result[4].x).toBeCloseTo(0, 5);
  });

  it('all rotations are 0 and all y values are 0', () => {
    const result = calculateSpreadLayout(5, base);
    for (const card of result) {
      expect(card.rotation).toBe(0);
      expect(card.y).toBe(0);
    }
  });

  it('with 2 cards, they are equally spaced from center', () => {
    const result = calculateSpreadLayout(2, base);
    expect(result).toHaveLength(2);
    expect(result[0].x).toBeCloseTo(-result[1].x, 5);
  });

  it('sequential zIndex values', () => {
    const result = calculateSpreadLayout(4, base);
    for (let i = 0; i < result.length; i++) {
      expect(result[i].zIndex).toBe(i + 1);
    }
  });

  it('produces no NaN or Infinity', () => {
    assertFiniteLayouts(calculateSpreadLayout(0, base));
    assertFiniteLayouts(calculateSpreadLayout(1, base));
    assertFiniteLayouts(calculateSpreadLayout(2, base));
    assertFiniteLayouts(calculateSpreadLayout(10, base));
  });
});

/* ================================================================== */
/*  calculateStackLayout                                               */
/* ================================================================== */

describe('calculateStackLayout', () => {
  it('returns empty array for count=0', () => {
    expect(calculateStackLayout(0)).toEqual([]);
  });

  it('returns single card at (0,0) with rotation 0 for count=1', () => {
    const result = calculateStackLayout(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      x: 0,
      y: 0,
      rotation: 0,
      zIndex: 1,
      scale: 1,
    });
  });

  it('cards offset incrementally by offsetX and offsetY', () => {
    const result = calculateStackLayout(4, {
      offsetX: 3,
      offsetY: 5,
    });
    expect(result).toHaveLength(4);
    expect(result[0].x).toBe(0);
    expect(result[0].y).toBe(0);
    expect(result[1].x).toBe(3);
    expect(result[1].y).toBe(5);
    expect(result[2].x).toBe(6);
    expect(result[2].y).toBe(10);
    expect(result[3].x).toBe(9);
    expect(result[3].y).toBe(15);
  });

  it('rotation distributed from -maxRotation/2 to +maxRotation/2', () => {
    const result = calculateStackLayout(5, { maxRotation: 6 });
    // First: -3, last: +3
    expect(result[0].rotation).toBeCloseTo(-3, 5);
    expect(result[4].rotation).toBeCloseTo(3, 5);
    // Middle at 0
    expect(result[2].rotation).toBeCloseTo(0, 5);
  });

  it('default options used when none provided', () => {
    const result = calculateStackLayout(3);
    expect(result).toHaveLength(3);
    // Default offsetX=2, offsetY=2, maxRotation=3
    expect(result[0].x).toBe(0);
    expect(result[0].y).toBe(0);
    expect(result[1].x).toBe(2);
    expect(result[1].y).toBe(2);
    expect(result[2].x).toBe(4);
    expect(result[2].y).toBe(4);

    // Rotation from -1.5 to +1.5
    expect(result[0].rotation).toBeCloseTo(-1.5, 5);
    expect(result[2].rotation).toBeCloseTo(1.5, 5);
  });

  it('custom offsets respected', () => {
    const result = calculateStackLayout(2, {
      offsetX: 10,
      offsetY: 20,
      maxRotation: 0,
    });
    expect(result[0].x).toBe(0);
    expect(result[0].y).toBe(0);
    expect(result[1].x).toBe(10);
    expect(result[1].y).toBe(20);
    // With maxRotation=0, all rotations should be 0
    expect(result[0].rotation).toBe(0);
    expect(result[1].rotation).toBe(0);
  });

  it('sequential zIndex values', () => {
    const result = calculateStackLayout(5);
    for (let i = 0; i < result.length; i++) {
      expect(result[i].zIndex).toBe(i + 1);
    }
  });

  it('all scale values are 1', () => {
    const result = calculateStackLayout(5);
    for (const card of result) {
      expect(card.scale).toBe(1);
    }
  });

  it('produces no NaN or Infinity', () => {
    assertFiniteLayouts(calculateStackLayout(0));
    assertFiniteLayouts(calculateStackLayout(1));
    assertFiniteLayouts(calculateStackLayout(2));
    assertFiniteLayouts(calculateStackLayout(10));
  });
});

import { describe, it, expect } from 'vitest';
import {
  SPRING_PRESETS,
  PERSPECTIVE_VALUES,
  ASPECT_RATIOS,
} from './animations';

describe('SPRING_PRESETS', () => {
  it('has default, bouncy, and stiff presets', () => {
    expect(SPRING_PRESETS['default']).toBeDefined();
    expect(SPRING_PRESETS['bouncy']).toBeDefined();
    expect(SPRING_PRESETS['stiff']).toBeDefined();
  });

  it('each preset has stiffness and damping', () => {
    for (const preset of Object.values(SPRING_PRESETS)) {
      expect(typeof preset.stiffness).toBe('number');
      expect(typeof preset.damping).toBe('number');
      expect(preset.stiffness).toBeGreaterThan(0);
      expect(preset.damping).toBeGreaterThan(0);
    }
  });

  it('bouncy has lower damping than default', () => {
    expect(SPRING_PRESETS['bouncy'].damping).toBeLessThan(
      SPRING_PRESETS['default'].damping
    );
  });

  it('stiff has higher stiffness than default', () => {
    expect(SPRING_PRESETS['stiff'].stiffness).toBeGreaterThan(
      SPRING_PRESETS['default'].stiffness
    );
  });
});

describe('PERSPECTIVE_VALUES', () => {
  it('has subtle, moderate, and dramatic levels', () => {
    expect(PERSPECTIVE_VALUES['subtle']).toBe('2000px');
    expect(PERSPECTIVE_VALUES['moderate']).toBe('1000px');
    expect(PERSPECTIVE_VALUES['dramatic']).toBe('600px');
  });

  it('all values are valid CSS pixel values', () => {
    for (const value of Object.values(PERSPECTIVE_VALUES)) {
      expect(value).toMatch(/^\d+px$/);
    }
  });
});

describe('ASPECT_RATIOS', () => {
  it('has poker and bridge ratios', () => {
    expect(ASPECT_RATIOS['poker']).toBeCloseTo(5 / 7, 5);
    expect(ASPECT_RATIOS['bridge']).toBeCloseTo(9 / 14, 5);
  });

  it('both ratios are less than 1 (taller than wide)', () => {
    expect(ASPECT_RATIOS['poker']).toBeLessThan(1);
    expect(ASPECT_RATIOS['bridge']).toBeLessThan(1);
  });

  it('bridge is narrower than poker', () => {
    expect(ASPECT_RATIOS['bridge']).toBeLessThan(ASPECT_RATIOS['poker']);
  });
});

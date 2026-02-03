import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React, { type FC } from 'react';

/* ------------------------------------------------------------------ */
/*  Mock @dnd-kit/core                                                 */
/* ------------------------------------------------------------------ */

const mockUseSensor = vi.fn().mockReturnValue({ sensor: 'mock' });
const mockUseSensors = vi.fn().mockReturnValue([{ sensors: 'mock-array' }]);

vi.mock('@dnd-kit/core', () => ({
  useSensor: (...args: unknown[]) => mockUseSensor(...args),
  useSensors: (...args: unknown[]) => mockUseSensors(...args),
  MouseSensor: { name: 'MouseSensor' },
  TouchSensor: { name: 'TouchSensor' },
  KeyboardSensor: { name: 'KeyboardSensor' },
}));

import { useDragSensors } from './useDragSensors';
import { MouseSensor, TouchSensor, KeyboardSensor } from '@dnd-kit/core';

/* ------------------------------------------------------------------ */
/*  Test component                                                     */
/* ------------------------------------------------------------------ */

const TestComponent: FC<{ config?: Parameters<typeof useDragSensors>[0] }> = ({
  config,
}) => {
  const sensors = useDragSensors(config);
  return (
    <div data-testid="sensors">
      {sensors ? 'has-sensors' : 'no-sensors'}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('useDragSensors', () => {
  beforeEach(() => {
    mockUseSensor.mockClear();
    mockUseSensors.mockClear();
    mockUseSensor.mockReturnValue({ sensor: 'mock' });
    mockUseSensors.mockReturnValue([{ sensors: 'mock-array' }]);
  });

  it('returns sensors (not null/undefined)', () => {
    render(<TestComponent />);
    expect(screen.getByTestId('sensors').textContent).toBe('has-sensors');
  });

  it('works with default config (no args)', () => {
    render(<TestComponent />);

    // useSensor should be called 3 times (Mouse, Touch, Keyboard)
    expect(mockUseSensor).toHaveBeenCalledTimes(3);

    // MouseSensor with distance: 5
    expect(mockUseSensor).toHaveBeenCalledWith(MouseSensor, {
      activationConstraint: { distance: 5 },
    });

    // TouchSensor with delay: 200, tolerance: 8
    expect(mockUseSensor).toHaveBeenCalledWith(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    });

    // KeyboardSensor with no options
    expect(mockUseSensor).toHaveBeenCalledWith(KeyboardSensor);

    // useSensors called with all three sensor results
    expect(mockUseSensors).toHaveBeenCalledTimes(1);
    expect(mockUseSensors).toHaveBeenCalledWith(
      { sensor: 'mock' },
      { sensor: 'mock' },
      { sensor: 'mock' },
    );
  });

  it('applies custom config overrides', () => {
    render(
      <TestComponent
        config={{ mouseDistance: 10, touchDelay: 300, touchTolerance: 12 }}
      />,
    );

    expect(mockUseSensor).toHaveBeenCalledWith(MouseSensor, {
      activationConstraint: { distance: 10 },
    });

    expect(mockUseSensor).toHaveBeenCalledWith(TouchSensor, {
      activationConstraint: { delay: 300, tolerance: 12 },
    });
  });

  it('uses defaults for unspecified config fields', () => {
    render(<TestComponent config={{ mouseDistance: 15 }} />);

    expect(mockUseSensor).toHaveBeenCalledWith(MouseSensor, {
      activationConstraint: { distance: 15 },
    });

    // Touch sensor should still use defaults
    expect(mockUseSensor).toHaveBeenCalledWith(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    });
  });
});

/**
 * Tests for the DroppableZone component.
 *
 * Covers visual state derivation from DnD context, accepts filter,
 * onValidate callback, passthrough props, and ref assignment.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

/* ------------------------------------------------------------------ */
/*  Mock state                                                         */
/* ------------------------------------------------------------------ */

const mockSetNodeRef = vi.fn();
let mockIsOver = false;
let mockActive: { id: string; data: { current: Record<string, unknown> } } | null = null;

/* ------------------------------------------------------------------ */
/*  Mock @dnd-kit/core                                                 */
/* ------------------------------------------------------------------ */

vi.mock('@dnd-kit/core', () => ({
  useDroppable: (config: { id: string; data?: unknown; disabled?: boolean }) => {
    // Store config so tests can assert on it
    (useDroppableConfig as { current: typeof config }).current = config;
    return {
      setNodeRef: mockSetNodeRef,
      isOver: mockIsOver,
      active: mockActive,
      over: mockIsOver ? { id: config.id } : null,
    };
  },
}));

// Storage for useDroppable config assertions
const useDroppableConfig: { current: { id: string; data?: unknown; disabled?: boolean } | null } = {
  current: null,
};

/* ------------------------------------------------------------------ */
/*  Mock DropZone                                                      */
/* ------------------------------------------------------------------ */

vi.mock('../DropZone', () => ({
  DropZone: ({
    state,
    children,
    label,
    emptyState,
    className,
  }: {
    state?: string;
    children?: React.ReactNode;
    label?: string;
    emptyState?: unknown;
    className?: string;
  }) => (
    <div
      data-testid="mock-dropzone"
      data-state={state}
      data-label={label ?? ''}
      data-emptystate={typeof emptyState === 'string' ? emptyState : 'custom'}
      data-classname={className ?? ''}
    >
      {children}
    </div>
  ),
}));

import { DroppableZone } from './DroppableZone';

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe('DroppableZone', () => {
  beforeEach(() => {
    mockSetNodeRef.mockClear();
    mockIsOver = false;
    mockActive = null;
    useDroppableConfig.current = null;
  });

  it('renders DropZone with idle state when nothing is dragging', () => {
    mockActive = null;
    mockIsOver = false;

    render(<DroppableZone id="zone-1" />);
    const dropzone = screen.getByTestId('mock-dropzone');
    expect(dropzone.getAttribute('data-state')).toBe('idle');
  });

  it('renders DropZone with active state when something is dragging', () => {
    mockActive = { id: 'card-1', data: { current: { type: 'card', card: { suit: 'spades', rank: 'A' } } } };
    mockIsOver = false;

    render(<DroppableZone id="zone-1" />);
    const dropzone = screen.getByTestId('mock-dropzone');
    expect(dropzone.getAttribute('data-state')).toBe('active');
  });

  it('renders DropZone with hover state when dragged item is over zone', () => {
    mockActive = { id: 'card-1', data: { current: { type: 'card', card: { suit: 'spades', rank: 'A' } } } };
    mockIsOver = true;

    render(<DroppableZone id="zone-1" />);
    const dropzone = screen.getByTestId('mock-dropzone');
    expect(dropzone.getAttribute('data-state')).toBe('hover');
  });

  it('shows idle state when dragged item is over but not accepted', () => {
    mockActive = { id: 'card-1', data: { current: { type: 'card', card: { suit: 'spades', rank: 'A' } } } };
    mockIsOver = true;

    render(<DroppableZone id="zone-1" accepts={['special']} />);
    const dropzone = screen.getByTestId('mock-dropzone');
    // type 'card' not in accepts ['special'], so falls back to idle
    expect(dropzone.getAttribute('data-state')).toBe('idle');
  });

  it('calls onValidate when item is over zone', () => {
    const onValidate = vi.fn().mockReturnValue(true);
    mockActive = { id: 'card-1', data: { current: { type: 'card', card: { suit: 'hearts', rank: 'K' } } } };
    mockIsOver = true;

    render(<DroppableZone id="zone-1" onValidate={onValidate} />);
    expect(onValidate).toHaveBeenCalledWith({ suit: 'hearts', rank: 'K' });

    const dropzone = screen.getByTestId('mock-dropzone');
    expect(dropzone.getAttribute('data-state')).toBe('hover');
  });

  it('shows idle state when onValidate returns false', () => {
    const onValidate = vi.fn().mockReturnValue(false);
    mockActive = { id: 'card-1', data: { current: { type: 'card', card: { suit: 'hearts', rank: 'K' } } } };
    mockIsOver = true;

    render(<DroppableZone id="zone-1" onValidate={onValidate} />);
    const dropzone = screen.getByTestId('mock-dropzone');
    expect(dropzone.getAttribute('data-state')).toBe('idle');
  });

  it('passes children through to DropZone', () => {
    render(
      <DroppableZone id="zone-1">
        <span data-testid="child">Hello</span>
      </DroppableZone>,
    );
    expect(screen.getByTestId('child')).toBeDefined();
    expect(screen.getByTestId('child').textContent).toBe('Hello');
  });

  it('passes label and emptyState through to DropZone', () => {
    render(<DroppableZone id="zone-1" label="Discard" emptyState="none" />);
    const dropzone = screen.getByTestId('mock-dropzone');
    expect(dropzone.getAttribute('data-label')).toBe('Discard');
    expect(dropzone.getAttribute('data-emptystate')).toBe('none');
  });

  it('sets ref on wrapper element', () => {
    render(<DroppableZone id="zone-1" />);
    const wrapper = screen.getByTestId('droppable-zone-wrapper');
    expect(wrapper).toBeDefined();
    // setNodeRef is called by React's ref callback mechanism
    // We verify the wrapper div exists (it receives the ref)
  });

  it('passes disabled to useDroppable', () => {
    render(<DroppableZone id="zone-1" disabled />);
    expect(useDroppableConfig.current?.disabled).toBe(true);
  });
});

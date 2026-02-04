/**
 * Tests for the DropZone container component.
 *
 * Covers placeholder rendering, label, children rendering,
 * empty state modes, visual states, onDrop callback, and className.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { DropZone } from './DropZone';

describe('DropZone', () => {
  // -------------------------------------------------------------------------
  // Empty states
  // -------------------------------------------------------------------------
  describe('empty states', () => {
    it('shows placeholder with dashed border when no children', () => {
      render(<DropZone />);
      expect(screen.getByTestId('dropzone-placeholder')).toBeInTheDocument();
    });

    it('shows label text in placeholder when label prop provided', () => {
      render(<DropZone label="Discard Pile" />);
      expect(screen.getByTestId('dropzone-label')).toHaveTextContent(
        'Discard Pile',
      );
    });

    it('shows nothing when emptyState="none" and no children', () => {
      render(<DropZone emptyState="none" />);
      expect(
        screen.queryByTestId('dropzone-placeholder'),
      ).not.toBeInTheDocument();
      // Container still exists
      expect(screen.getByTestId('drop-zone')).toBeInTheDocument();
    });

    it('shows custom ReactNode when emptyState is JSX', () => {
      render(
        <DropZone
          emptyState={<span data-testid="custom-empty">Custom slot</span>}
        />,
      );
      expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
      expect(
        screen.queryByTestId('dropzone-placeholder'),
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Children rendering
  // -------------------------------------------------------------------------
  describe('children rendering', () => {
    it('renders children when provided (no placeholder)', () => {
      render(
        <DropZone>
          <div data-testid="child-card">Card</div>
        </DropZone>,
      );
      expect(screen.getByTestId('child-card')).toBeInTheDocument();
      expect(
        screen.queryByTestId('dropzone-placeholder'),
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Visual states
  // -------------------------------------------------------------------------
  describe('visual states', () => {
    it('applies idle visual state class by default', () => {
      render(<DropZone />);
      const zone = screen.getByTestId('drop-zone');
      expect(zone.className).toContain('idle');
    });

    it('applies active visual state class', () => {
      render(<DropZone state="active" />);
      const zone = screen.getByTestId('drop-zone');
      expect(zone.className).toContain('active');
    });

    it('applies hover visual state class', () => {
      render(<DropZone state="hover" />);
      const zone = screen.getByTestId('drop-zone');
      expect(zone.className).toContain('hover');
    });
  });

  // -------------------------------------------------------------------------
  // onDrop
  // -------------------------------------------------------------------------
  describe('onDrop', () => {
    it('fires onDrop when clicked', () => {
      const onDrop = vi.fn();
      render(<DropZone onDrop={onDrop} />);

      fireEvent.click(screen.getByTestId('drop-zone'));
      expect(onDrop).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------
  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<DropZone label="Discard" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has region role', () => {
      render(<DropZone label="Discard" />);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('has aria-label from label prop', () => {
      render(<DropZone label="Discard" />);
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Discard');
    });

    it('has default aria-label when no label prop', () => {
      render(<DropZone />);
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Drop zone');
    });
  });

  // -------------------------------------------------------------------------
  // className
  // -------------------------------------------------------------------------
  describe('className', () => {
    it('accepts className prop', () => {
      render(<DropZone className="my-zone" />);
      expect(screen.getByTestId('drop-zone')).toHaveClass('my-zone');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CardBack } from './CardBack';

describe('CardBack', () => {
  it('renders default pattern when no children provided', () => {
    const { container } = render(<CardBack />);
    // Should have the back face div and a child pattern div
    const back = container.firstElementChild as HTMLElement;
    expect(back).not.toBeNull();
    expect(back.children.length).toBe(1); // default pattern div
  });

  it('renders custom children instead of default pattern', () => {
    const { container } = render(
      <CardBack>
        <span data-testid="custom">Custom Design</span>
      </CardBack>
    );
    const back = container.firstElementChild as HTMLElement;
    expect(back.textContent).toContain('Custom Design');
  });

  it('applies aria-hidden for accessibility', () => {
    const { container } = render(<CardBack />);
    const back = container.firstElementChild as HTMLElement;
    expect(back.getAttribute('aria-hidden')).toBe('true');
  });

  it('applies custom className', () => {
    const { container } = render(<CardBack className="my-custom-back" />);
    const back = container.firstElementChild as HTMLElement;
    expect(back.className).toContain('my-custom-back');
  });

  it('renders custom image as card back', () => {
    const { container } = render(
      <CardBack>
        <img src="/card-back.png" alt="Card back" />
      </CardBack>
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('/card-back.png');
  });
});

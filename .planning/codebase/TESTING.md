# Testing Patterns

**Analysis Date:** 2026-02-04

## Test Framework

**Runner:**
- Vitest 3.0.0
- Config: `vitest.config.ts`

**Assertion Library:**
- Vitest (built-in)
- `@testing-library/jest-dom` (extended matchers for DOM)
- `vitest-axe` (accessibility testing)

**Run Commands:**
```bash
npm test                # Run all tests once
npm run test:watch      # Watch mode
npm run test:coverage   # Generate coverage report
```

**Coverage Configuration:**
- Provider: v8
- Reporters: text, json, html, lcov
- Thresholds: 80% for lines, functions, branches, statements
- Excluded: test files, stories, index files, type declarations, test setup

## Test File Organization

**Location:**
- Co-located: test files live alongside source files
- Pattern: `src/components/Card/Card.test.tsx` sits next to `src/components/Card/Card.tsx`

**Naming:**
- Component tests: `ComponentName.test.tsx`
- Hook tests: `hookName.test.ts`
- Utility tests: `utilityName.test.ts`

**Structure:**
```
src/
├── components/
│   ├── Card/
│   │   ├── Card.tsx
│   │   ├── Card.test.tsx
│   │   ├── CardFace.tsx
│   │   ├── CardFace.test.tsx
│   │   └── CardBack.test.tsx
├── hooks/
│   ├── useCardFlip.ts
│   └── useCardFlip.test.ts
├── utils/
│   ├── a11y.ts
│   └── a11y.test.ts
└── state/
    ├── reducer.ts
    └── reducer.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
describe('ComponentName', () => {
  describe('feature category', () => {
    it('describes specific behavior', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

**Patterns:**
- Top-level `describe` matches file/component name
- Nested `describe` blocks group related behaviors:
  - `rendering`
  - `controlled mode`
  - `uncontrolled mode`
  - `events`
  - `accessibility`
  - `accessibility - axe` (automated a11y scans)
- `it` statements are descriptive: "renders a card element with role='button'"
- Tests follow Arrange-Act-Assert pattern (implicit, no comments)

**Example from `src/components/Card/Card.test.tsx`:**
```typescript
describe('Card', () => {
  describe('rendering', () => {
    it('renders a card element with role="button"', () => {
      render(<Card card="♠A" isFaceUp={true} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('controlled mode', () => {
    it('respects isFaceUp prop changes', () => {
      const { rerender } = render(<Card card="♠A" isFaceUp={true} />);
      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(<Card card="♠A" isFaceUp={false} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('accessibility - axe', () => {
    it('has no axe violations when face up', async () => {
      const { container } = render(<Card card="♠A" isFaceUp={true} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
```

## Mocking

**Framework:** Vitest (built-in mocking)

**Patterns:**
```typescript
// Mock window.matchMedia for reduced motion hook
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterAll(() => {
  vi.restoreAllMocks();
});

// Mock callbacks
const onClick = vi.fn();
render(<Card card="♠A" onClick={onClick} />);
fireEvent.click(screen.getByRole('button'));
expect(onClick).toHaveBeenCalledWith({
  suit: 'spades',
  rank: 'A',
  isFaceUp: true,
});
```

**What to Mock:**
- Browser APIs not implemented in jsdom (`window.matchMedia`, `navigator.vibrate`)
- Callback props to verify they are called with correct arguments
- External dependencies when testing in isolation (rarely needed)

**What NOT to Mock:**
- React Testing Library utilities (use real implementations)
- Internal module imports (test integration, not isolation)
- Motion library (tests verify motion values exist, not animation frames)
- State reducers (test pure functions with real logic)

## Fixtures and Factories

**Test Data:**
```typescript
// Helper factory functions in test files
function card(
  suit: CardState['suit'],
  rank: CardState['rank'],
  overrides: Partial<CardState> = {}
): CardState {
  return { suit, rank, faceUp: false, selected: false, ...overrides };
}

function stateWith(locations: Record<string, CardState[]>): GameState {
  return createInitialState({ locations });
}

// Usage in tests
const state = stateWith({
  deck: [card('spades', 'A'), card('hearts', 'K')],
  hand: [card('clubs', '3')],
});
```

**Location:**
- Factories defined at top of test file (not extracted to shared module)
- Prefer inline test data for simple cases
- Factory functions for complex object construction with sensible defaults

## Coverage

**Requirements:** 80% for all metrics (lines, functions, branches, statements)

**View Coverage:**
```bash
npm run test:coverage
```

**Current Status:**
- Coverage report generated in `coverage/` directory
- HTML report available for browser viewing
- LCOV format for CI integration

**Coverage Exclusions:**
- Test files (`**/*.test.{ts,tsx}`)
- Storybook stories (`**/*.stories.{ts,tsx}`)
- Barrel exports (`**/index.ts`)
- Test setup (`src/test-setup.ts`)
- Type declarations (`src/css-modules.d.ts`)

## Test Types

**Unit Tests:**
- Scope: Individual functions, hooks, or components in isolation
- Approach: Test single responsibility with minimal dependencies
- Example: `src/hooks/useCardFlip.test.ts` tests hook logic without rendering full UI
- Pattern: Use `renderHook` from `@testing-library/react` for hook testing

**Integration Tests:**
- Scope: Component interactions, state management flows
- Approach: Test components with their child components and hooks
- Example: `src/components/Card/Card.test.tsx` tests Card with CardFace and CardBack
- Pattern: Full render with `render()`, verify DOM output and event handling

**E2E Tests:**
- Not used in this library
- Consumer applications responsible for E2E testing

## Common Patterns

**Async Testing:**
```typescript
it('has no axe violations when face up', async () => {
  const { container } = render(<Card card="♠A" isFaceUp={true} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Error Testing:**
```typescript
it('returns unchanged state if source location does not exist', () => {
  const state = stateWith({ hand: [card('spades', 'A')] });
  const result = gameReducer(state, {
    type: 'MOVE_CARD',
    payload: { cardIndex: 0, from: 'nonexistent', to: 'hand' },
  });
  expect(result).toBe(state);
});
```

**Component Testing with @testing-library/react:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';

it('calls onClick with card data', () => {
  const onClick = vi.fn();
  render(<Card card="♠A" isFaceUp={true} onClick={onClick} />);

  fireEvent.click(screen.getByRole('button'));

  expect(onClick).toHaveBeenCalledWith({
    suit: 'spades',
    rank: 'A',
    isFaceUp: true,
  });
});
```

**Hook Testing:**
```typescript
import { renderHook, act } from '@testing-library/react';

it('returns rotateY of 0 when isFaceUp is true', () => {
  const { result } = renderHook(() =>
    useCardFlip({ isFaceUp: true }),
  );

  expect(result.current.rotateY.get()).toBe(0);
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

  const rotation = result.current.rotateY.get();
  expect(typeof rotation).toBe('number');
});
```

**Ref Testing:**
```typescript
import { createRef } from 'react';
import { act } from '@testing-library/react';

it('exposes flip method via ref', () => {
  const ref = createRef<CardRef>();
  render(<Card card="♠A" ref={ref} />);

  expect(ref.current).not.toBeNull();
  expect(ref.current!.isFaceUp()).toBe(true);

  act(() => {
    ref.current!.flip();
  });

  expect(ref.current!.isFaceUp()).toBe(false);
});
```

**Accessibility Testing:**
```typescript
// Automated axe scans
it('has no axe violations when face up', async () => {
  const { container } = render(<Card card="♠A" isFaceUp={true} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// ARIA attribute testing
it('has correct ARIA label for spades ace', () => {
  render(<Card card="♠A" isFaceUp={true} />);
  expect(screen.getByRole('button')).toHaveAttribute(
    'aria-label',
    'Ace of Spades',
  );
});

// Keyboard interaction testing
it('activates on Enter key press', () => {
  const onClick = vi.fn();
  render(<Card card="♠A" isFaceUp={true} onClick={onClick} />);
  fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
  expect(onClick).toHaveBeenCalled();
});
```

**Reducer/Pure Function Testing:**
```typescript
it('moves a card from one location to another by index', () => {
  const state = stateWith({
    deck: [card('spades', 'A'), card('hearts', 'K')],
    hand: [card('clubs', '3')],
  });

  const result = gameReducer(state, {
    type: 'MOVE_CARD',
    payload: { cardIndex: 0, from: 'deck', to: 'hand' },
  });

  expect(result.locations.deck).toHaveLength(1);
  expect(result.locations.deck[0].rank).toBe('K');
  expect(result.locations.hand).toHaveLength(2);
  expect(result.locations.hand[1].rank).toBe('A');
});
```

**Rerender Testing:**
```typescript
it('respects isFaceUp prop changes', () => {
  const { rerender } = render(<Card card="♠A" isFaceUp={true} />);
  expect(screen.getByRole('button')).toBeInTheDocument();

  rerender(<Card card="♠A" isFaceUp={false} />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

**Multiple Assertions:**
- Queries use `getByRole`, `getByText`, `getAllByText` from Testing Library
- Prefer semantic queries (`getByRole`) over implementation details (`getByTestId`)
- Multiple related assertions in single test when testing same behavior

## Test Setup

**Global Setup:**
- File: `src/test-setup.ts`
- Imports: `@testing-library/jest-dom/vitest`, `vitest-axe/matchers`, `vitest-axe/extend-expect`
- Extended matchers: `toBeInTheDocument()`, `toHaveNoViolations()`, etc.

**Test Environment:**
- jsdom (browser-like environment)
- Globals enabled (no need to import `describe`, `it`, `expect`)
- Setup file runs before all tests

---

*Testing analysis: 2026-02-04*

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-02)

**Core value:** Developers can drop in fully interactive card components without building card UI from scratch
**Current focus:** Phase 6 - Developer Experience & Build (In Progress)

## Current Position

Phase: 6 of 6 (Developer Experience & Build)
Plan: 4 of 5 in current phase
Status: In progress
Last activity: 2026-02-04 - Completed 06-04-PLAN.md

Progress: [############################----] 28/29 plans (97%)

## Performance Metrics

**Velocity:**
- Total plans completed: 28
- Average duration: 7 min
- Total execution time: 189 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation | 4/4 | 48 min | 12 min |
| 2 - Containers | 4/4 | 24 min | 6 min |
| 3 - Drag & Drop | 5/5 | 23 min | 5 min |
| 4 - State Management | 6/6 | 21 min | 4 min |
| 5 - Accessibility | 5/5 | 40 min | 8 min |
| 6 - DX & Build | 4/5 | 33 min | 8 min |

**Recent Trend:**
- Last 5 plans: 05-05 (17 min), 06-01 (6 min), 06-02 (7 min), 06-03 (10 min), 06-04 (10 min)
- Trend: Phase 6 averaging ~8 min per plan

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Const assertion pattern for Suit/Rank types (typeof arr[number])
- parseCard supports both emoji and text notation
- React as peer dependency (not bundled)
- Vitest 3.x (4.x not yet available)
- vite-plugin-dts for library .d.ts generation
- Reuse ColorScheme from constants rather than redefining in component types
- Display rank T as "10" in rendered output
- Inline style for suit colors using getSuitColor utility
- CSS module type declarations at src/css-modules.d.ts
- useSpring (not useMotionValue) for automatic spring-animated transitions
- 4-point opacity transform [0,89,90,180] for sharp crossover at 90 degrees
- useMotionValueEvent for animation lifecycle tracking
- Custom usePrefersReducedMotion independent of Motion library
- CSS grid (3-col x 5-row) for pip layouts matching traditional card arrangements
- Number cards (2-10) show pip grids; face cards and Ace show single large symbol
- Bottom-half pips rotated 180deg for visual symmetry
- forwardRef + useImperativeHandle for uncontrolled component ref API
- Fan angle scaling: count<=3 uses count/5, count>3 uses sqrt(count/7)
- Spread spacing clamps to minOverlap when container is too narrow
- useContainerSize rounds via Math.round with functional updater for identity preservation
- Hook tests use component render approach rather than useRef spy
- Card dimensions in Hand: clamp(60, containerWidth/(count+4), 120) with 1.4x aspect ratio
- AnimatePresence key uses formatCard(card) for stable identity across reorders
- Selected card y-offset of -15px via motion animate prop
- Motion/react test mock: importOriginal + override motion.div and AnimatePresence
- Deck renders max 5 visual layers for stack depth effect
- CardStack defaults to 'top-only' face-up mode
- DropZone visual states controlled via prop (future DnD context integration)
- Container empty state pattern: 'none' | 'placeholder' | ReactNode
- Named exports in src/index.ts for explicit public API surface
- Wildcard re-exports in src/components/index.ts for internal convenience
- Separate MouseSensor + TouchSensor instead of PointerSensor for iOS Safari scroll prevention
- @dnd-kit/modifiers installed at 9.0.0 (latest available)
- useHapticFeedback uses useMemo keyed on enabled+isSupported for referential stability
- CardDndProviderProps extends DragLifecycleCallbacks via interface extension
- DragOverlay always mounted, children conditionally rendered (dnd-kit pitfall 4)
- Wrapper div for useDroppable ref to avoid modifying Phase 2 DropZone
- Multi-card stack shows max 3 visual cards with +N badge
- DroppableZone supports both accepts array and onValidate callback
- Component-level CardDndProviderProps uses simplified card callbacks (card, zoneId) not raw dnd-kit events
- Drop validation checks zone data.onValidate first, falls back to data.accepts array
- activeCard state managed internally; consumer never touches DndContext directly
- Barrel exports expanded to include all Phase 3 DnD components, hooks, and types
- ReactNode over JSX.Element for return type annotations in TSX layout files
- GameState uses Record<string, CardState[]> for nested-by-location structure
- CardState extends CardData identity with faceUp, selected, position UI fields
- Pure gameReducer with zero RTK imports for dual-mode compatibility
- SET_LOCATIONS merges into existing locations (preserves unmentioned keys)
- DEAL_CARDS gracefully stops when source exhausted
- selectCard selector aliased as selectCardState in barrel to avoid action creator collision
- useLocation uses module-level EMPTY constant for stable empty-array reference with useSyncExternalStore
- GameDispatchFn = (type: string, payload?: Record<string, unknown>) => void for Redux-style API
- StateBackend interface: getState/dispatch/subscribe as strategy pattern pivot
- persist=true by default with configurable storageKey for Context mode
- useReducer lazy initializer merges base + persisted + prop overrides (no double render)
- Subscriber notification via useEffect on state change (not synchronous in dispatch)
- RTK and react-redux as optional peer dependencies via peerDependenciesMeta
- Immer-powered mutations in createSlice reducers (direct splice/push/assignment)
- Static ACTION_CREATOR_MAP bridges dispatch('TYPE', payload) to RTK action creators
- Plain action creators re-exported with Action suffix to avoid slice collision
- DTS types path uses vite-plugin-dts output structure (dist/index.d.ts, dist/redux/index.d.ts)
- Externalize @dnd-kit/* alongside React/motion/Redux in rollup for smaller bundles
- Multi-entry Vite build: object entry in build.lib.entry for separate bundles
- Card index lookup via suit+rank match in source location state for MOVE_CARD dispatch
- useGameState for fresh state snapshot in handleDragEnd callback
- autoDispatch defaults to true for zero-config state synchronization
- contentEditable check uses target.contentEditable === 'true' for jsdom compatibility
- useRovingTabIndex does not manage DOM focus directly; consuming component calls .focus()
- formatFaceDownLabel has no CardData parameter to prevent accidental identity leaks
- Browser default outline via :focus-visible for guaranteed keyboard visibility
- Green box-shadow for selected cards, distinct from blue focus outline
- Touch target 44x44px via ::before pseudo-element invisible expansion
- Static motionValue(0) for rotateY in reduced motion (no 3D rotation)
- 250ms crossfade duration for reduced motion card flip
- Static announcement constants outside component (not memoized inside)
- aria-roledescription and aria-label placed after {...attributes} spread for override
- aria-hidden={isDragging || undefined} hides source card during drag overlay
- Card ARIA labels use natural language ("Ace of Spades") via formatCardForSpeech
- Face-down cards announce as "Face-down card" without any identity information
- Hand uses role="listbox" with role="option" children and roving tabindex
- Card interactive prop suppresses role/tabIndex when nested inside interactive containers
- @testing-library/user-event for realistic keyboard simulation in Hand/Deck tests
- ESLint 9 flat config with ESM format (not legacy .eslintrc)
- @vitest/coverage-v8@^3.2.4 pinned to match vitest@^3.0 (4.x incompatible)
- 80% thresholds on lines/functions/branches/statements for coverage enforcement
- eslint-plugin-react-hooks@^7.0.1 for flat config native support
- CSS custom properties use var(--token, fallback) so components work without variables.css import
- DraggableAttributes and DraggableSyntheticListeners from dnd-kit for type-safe hook returns
- Card bevel shadows exposed as --card-front-bevel and --card-back-bevel tokens
- Four-color suit variables (--suit-blue, --suit-green) included alongside two-color defaults
- Two-pass Vite build: ESM multi-entry + UMD single-entry (multi-entry incompatible with UMD)
- UMD global name: CardComponents
- Redux entry ESM-only (no require/UMD) since Redux users always use bundlers
- sideEffects: ['**/*.css'] for tree-shaking all JS modules
- Size budgets: 60kB main, 10kB redux (brotli+minified) via size-limit
- ./styles subpath export for explicit CSS import
- Storybook 8.6 pinned (not 10.x) for stable react-vite framework integration
- CSF3 story format with satisfies Meta<typeof Component> for type safety
- Stories organized by use case: Getting Started/Card, Layouts/* for containers
- Global CSS variables imported in .storybook/preview.ts for consistent theming
- Stories import directly from component files (not barrel) for Storybook inference

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-02-04T11:02:00Z
Stopped at: Completed 06-04-PLAN.md
Resume file: None

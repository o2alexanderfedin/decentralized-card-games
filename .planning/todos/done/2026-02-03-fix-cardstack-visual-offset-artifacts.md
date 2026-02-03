---
created: 2026-02-03T21:30:00Z
title: Fix CardStack visual offset artifacts in demo
area: ui
files:
  - src/components/CardStack/CardStack.tsx:93-138
  - src/components/CardStack/CardStack.module.css:1-17
  - demo/App.tsx
---

## Problem

The CardStack component in the demo shows visible "ghost" outlines of stacked cards inside the card borders, creating a confusing visual artifact. This happens because:

1. **Multiple identical cards**: Demo renders 9 copies of 9♥, making offset layers obvious
2. **Small offset values**: Default offsetX=2, offsetY=2 creates subtle "shadow" rather than clear stacking
3. **No overflow clipping**: Card borders don't clip the offset cards behind them

From user screenshot: All three CardStack examples ("All face-up", "Top only", "All face-down") show multiple gray/white outlines inside the card borders, making it look like a rendering bug rather than intentional stacking.

This is technically correct behavior (CardStack is meant to show multiple cards), but the visual result is confusing in the demo context.

## Solution

Multiple approaches to consider:

**Option A: Demo data improvement**
- Use realistic card sequences (e.g., ["9h", "8h", "7h"] for a discard pile)
- Show CardStack with 3-4 cards max (not 9) to reduce visual noise
- Add descriptive text: "Discard pile" or "Played cards"

**Option B: Increase default offset**
- Change offsetX/offsetY defaults from 2px to 5-8px for clearer separation
- Update CardStack.types.ts defaults
- Risk: May affect other uses of CardStack

**Option C: Add overflow clipping**
- Add `overflow: hidden` to .stack container
- Cards slide out from under the top card (intentional design)
- Risk: Breaks the stacking visual metaphor

**Option D: Visual polish**
- Add subtle drop shadow to each card layer for depth
- Reduce opacity of lower layers (0.9, 0.8, 0.7...)
- Makes stacking more obvious as a feature

**Recommended**: Combination of A + D
- Fix demo to show realistic card sequences with 3-4 cards
- Add subtle shadow/opacity to emphasize stacking as a feature
- Keep default offsets (other components may rely on them)

## Acceptance Criteria

- [ ] CardStack in demo shows clear, intentional stacking effect
- [ ] No confusing "ghost outline" artifacts
- [ ] Visual design communicates "these are stacked cards"
- [ ] All CardStack tests still pass

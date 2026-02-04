---
created: 2026-02-03T20:40:00Z
title: Fix card pip positioning offset issue
area: ui
files:
  - src/components/Card/Card.module.css:98-126
  - src/components/Card/CardFace.tsx
  - demo/App.tsx
---

## Problem

Card pips (suit symbols for number cards) are visually offset/misaligned and not properly centered within the card boundaries. Screenshot evidence shows a 5 of Clubs where the club symbols are shifted and the card content appears to bleed outside its container.

Visual issues observed:
1. Pip symbols not properly centered in their grid cells
2. Card content appearing to overflow despite `overflow: hidden` fix
3. Possible interaction with DropZone container causing additional offset
4. Card may be larger than its allocated space, causing bleeding

The pip grid layout (`.pipGrid` in Card.module.css lines 108-116) uses CSS Grid with 3 columns and 5 rows, but the positioning may not be accounting for card padding, borders, or container constraints properly.

Root cause likely in:
- CSS Grid alignment in `.pipGrid`
- Card padding/border calculations
- Pip placement logic in CardFace.tsx
- Transform/positioning inheritance from parent containers

## Solution

TBD - Need to investigate:
1. Review `.pipGrid` CSS - check `justify-items`, `align-items` settings
2. Verify pip placement logic in CardFace.tsx matches CSS grid expectations
3. Check if card size calculations respect padding + border
4. Test pip positioning across all number cards (2-10) in isolation
5. Verify DropZone doesn't add unexpected transforms/positioning
6. Add visual regression tests for pip layouts
7. Consider explicit pip positioning with fractional grid placement

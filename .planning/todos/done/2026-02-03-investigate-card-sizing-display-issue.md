---
created: 2026-02-03T20:35:00Z
title: Investigate card sizing/display issue in user's browser
area: ui
files:
  - demo/App.tsx
  - src/components/Hand/Hand.tsx
  - src/components/Card/Card.module.css
---

## Problem

User reported seeing cards as very small/faint white circles with minimal detail visible in their browser view. Cards render correctly in automated testing (Playwright screenshots show full detail), but user's actual browser view shows dramatically different rendering.

Possible causes:
- CSS viewport scaling issues
- Card size calculations in Hand component producing very small dimensions
- Browser zoom level affecting card rendering
- Container width measurements producing incorrect values
- Demo App.tsx card sizing styles not accounting for all viewport sizes

Screenshot evidence shows 5 cards (A♥, K♦, Q♣, J♠, 10♥) arranged correctly in fan layout but appearing as tiny circles rather than full playing card detail.

## Solution

TBD - Need to investigate:
1. Check Hand component card sizing logic (cardWidth calculation in Hand.tsx)
2. Verify demo App.tsx container sizing and card constraints
3. Test across different viewport sizes and zoom levels
4. Add min-width constraints or explicit sizing in demo
5. Consider adding viewport meta tag if missing
6. Check if Card.module.css aspect-ratio is being respected

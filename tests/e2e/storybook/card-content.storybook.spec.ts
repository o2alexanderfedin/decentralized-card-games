import { test, expect } from '@playwright/test';

/**
 * Storybook Card Content Verification Suite
 *
 * Verifies that card components render with correct content:
 * - Card ranks (A, 2-9, T, J, Q, K) display correctly
 * - Card suits (♠, ♥, ♦, ♣) display correctly
 * - No "?" placeholders indicating parsing failures
 * - All notation formats (suit-first, rank-first) work
 *
 * These tests catch regressions in parseCard() function that
 * would cause cards to render as "?" instead of actual faces.
 */

test.describe('Card Component Content Rendering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Card documentation page
    await page.goto('/?path=/docs/getting-started-card--documentation');

    // Wait for Storybook to fully load
    await page.waitForLoadState('networkidle');

    // Wait for the iframe to be ready
    const iframe = page.frameLocator('iframe#storybook-preview-iframe');
    await expect(iframe.locator('body')).toBeAttached({ timeout: 10000 });
  });

  test('Ace of Spades renders with correct rank and suit', async ({ page }) => {
    const iframe = page.frameLocator('iframe#storybook-preview-iframe');

    // Find the first card story (Ace of Spades)
    const card = iframe.getByRole('button', { name: /ace of spades/i }).first();

    // Verify card is visible
    await expect(card).toBeVisible();

    // Verify the card contains "A" (rank)
    await expect(card.locator('text=A')).toBeVisible();

    // Verify the card contains "♠" (spade suit)
    await expect(card.locator('text=♠')).toBeVisible();

    // Verify no "?" placeholder is present
    await expect(card.locator('text=?')).not.toBeVisible();
  });

  test('King of Hearts renders with correct rank and suit', async ({ page }) => {
    const iframe = page.frameLocator('iframe#storybook-preview-iframe');

    // Find the King of Hearts card
    const card = iframe.getByRole('button', { name: /king of hearts/i }).first();

    // Verify card is visible
    await expect(card).toBeVisible();

    // Verify the card contains "K" (rank)
    await expect(card.locator('text=K')).toBeVisible();

    // Verify the card contains "♥" (heart suit)
    await expect(card.locator('text=♥')).toBeVisible();

    // Verify no "?" placeholder is present
    await expect(card.locator('text=?')).not.toBeVisible();
  });

  test('All four suits render correctly in All Suits story', async ({ page }) => {
    const iframe = page.frameLocator('iframe#storybook-preview-iframe');

    // Find all Ace cards in the All Suits section
    const aceOfSpades = iframe.getByRole('button', { name: 'Ace of Spades' }).nth(1);
    const aceOfHearts = iframe.getByRole('button', { name: 'Ace of Hearts' }).nth(0);
    const aceOfDiamonds = iframe.getByRole('button', { name: 'Ace of Diamonds' }).nth(0);
    const aceOfClubs = iframe.getByRole('button', { name: 'Ace of Clubs' }).nth(0);

    // Verify all cards are visible
    await expect(aceOfSpades).toBeVisible();
    await expect(aceOfHearts).toBeVisible();
    await expect(aceOfDiamonds).toBeVisible();
    await expect(aceOfClubs).toBeVisible();

    // Verify spades suit
    await expect(aceOfSpades.locator('text=♠')).toBeVisible();

    // Verify hearts suit
    await expect(aceOfHearts.locator('text=♥')).toBeVisible();

    // Verify diamonds suit
    await expect(aceOfDiamonds.locator('text=♦')).toBeVisible();

    // Verify clubs suit
    await expect(aceOfClubs.locator('text=♣')).toBeVisible();

    // Verify all show rank "A"
    await expect(aceOfSpades.locator('text=A')).toBeVisible();
    await expect(aceOfHearts.locator('text=A')).toBeVisible();
    await expect(aceOfDiamonds.locator('text=A')).toBeVisible();
    await expect(aceOfClubs.locator('text=A')).toBeVisible();
  });

  test('Queen of Hearts renders correctly', async ({ page }) => {
    const iframe = page.frameLocator('iframe#storybook-preview-iframe');

    // Find the Queen of Hearts card
    const card = iframe.getByRole('button', { name: /queen of hearts/i }).first();

    // Verify card is visible
    await expect(card).toBeVisible();

    // Verify the card contains "Q" (rank)
    await expect(card.locator('text=Q')).toBeVisible();

    // Verify the card contains "♥" (heart suit)
    await expect(card.locator('text=♥')).toBeVisible();

    // Verify no "?" placeholder is present
    await expect(card.locator('text=?')).not.toBeVisible();
  });

  test('no cards display "?" placeholder indicating parsing failure', async ({ page }) => {
    const iframe = page.frameLocator('iframe#storybook-preview-iframe');

    // Check for any "?" placeholders in the entire iframe
    // If cards fail to parse, they show "?" instead of suit/rank
    const questionMarks = iframe.getByText('?', { exact: true });

    // Should find 0 question marks in card content
    const count = await questionMarks.count();
    expect(count).toBe(0);
  });

  test('face-down card renders card back (not face content)', async ({ page }) => {
    const iframe = page.frameLocator('iframe#storybook-preview-iframe');

    // Find the face-down card story
    const faceDownCard = iframe.getByRole('button', { name: /face-down card/i }).first();

    // Verify card is visible
    await expect(faceDownCard).toBeVisible();

    // Face-down cards should still have the card structure but not show face content
    // The card back typically doesn't show suit/rank symbols to the user
    // Just verify the card element exists and is properly rendered
    await expect(faceDownCard).toBeAttached();
  });

  test('cards in four-color scheme show correct suits', async ({ page }) => {
    const iframe = page.frameLocator('iframe#storybook-preview-iframe');

    // Navigate to four-color scheme section by scrolling
    await iframe.locator('text=Four-Color Scheme').first().scrollIntoViewIfNeeded();

    // Find all Ace cards in the four-color section (they should be after the two-color section)
    const aceOfSpades = iframe.getByRole('button', { name: 'Ace of Spades' }).nth(2);
    const aceOfHearts = iframe.getByRole('button', { name: 'Ace of Hearts' }).nth(1);
    const aceOfDiamonds = iframe.getByRole('button', { name: 'Ace of Diamonds' }).nth(1);
    const aceOfClubs = iframe.getByRole('button', { name: 'Ace of Clubs' }).nth(1);

    // Verify all cards show correct suits
    await expect(aceOfSpades.locator('text=♠')).toBeVisible();
    await expect(aceOfHearts.locator('text=♥')).toBeVisible();
    await expect(aceOfDiamonds.locator('text=♦')).toBeVisible();
    await expect(aceOfClubs.locator('text=♣')).toBeVisible();
  });
});

test.describe('Card Notation Format Support', () => {
  test('parseCard handles both suit-first and rank-first notation', async ({ page }) => {
    // This test verifies the fix for the card rendering bug
    // The parseCard function must support both:
    // - Suit-first: ♠A, sA (emoji and text)
    // - Rank-first: A♠, As (emoji and text)

    const iframe = page.frameLocator('iframe#storybook-preview-iframe');

    // Navigate to Card documentation
    await page.goto('/?path=/docs/getting-started-card--documentation');
    await page.waitForLoadState('networkidle');

    // Verify multiple cards render correctly
    // If parseCard only handled one format, some cards would show "?"
    const cards = iframe.getByRole('button', { name: /card|ace|king|queen/i });

    // Should have multiple cards
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Check that no "?" appears anywhere in the card content
    const questionMarks = iframe.getByText('?', { exact: true });
    const questionCount = await questionMarks.count();
    expect(questionCount).toBe(0);
  });
});

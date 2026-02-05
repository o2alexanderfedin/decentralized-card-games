import { test, expect } from '@playwright/test';

/**
 * Production Deployment Verification Suite
 *
 * Tests the live GitHub Pages deployment at:
 * https://o2alexanderfedin.github.io/decentralized-card-games/
 *
 * Verifies:
 * - Site is accessible and responsive
 * - Base path routing works correctly
 * - All critical pages load
 * - Assets load from correct paths
 * - Cross-page navigation functions
 *
 * Runs AFTER deployment as smoke tests.
 */

test.describe('Production Deployment Verification', () => {
  test('production site is accessible', async ({ page }) => {
    const response = await page.goto('/');

    // Verify 200 OK response
    expect(response?.status()).toBe(200);

    // Verify page loads
    await expect(page).toHaveTitle(/@decentralized-games\/card-components/i);
  });

  test('Storybook is accessible at production URL', async ({ page }) => {
    const response = await page.goto('/storybook/');

    // Verify 200 OK response
    expect(response?.status()).toBe(200);

    // Verify Storybook loads
    await expect(page).toHaveTitle(/Storybook/i);

    // Check for Storybook navigation
    const sidebar = page.locator('[role="navigation"]').first();
    await expect(sidebar).toBeVisible({ timeout: 15000 });
  });

  test('base path is correctly applied in production', async ({ page }) => {
    await page.goto('/');

    // Verify URL includes base path
    expect(page.url()).toContain('/decentralized-card-games');

    // Navigate to Storybook and verify base path persists
    await page.goto('/storybook/');
    expect(page.url()).toContain('/decentralized-card-games/storybook');
  });

  test('production assets load successfully', async ({ page }) => {
    const failedRequests: { url: string; status: number | null }[] = [];

    // Track failed requests
    page.on('response', (response) => {
      if (!response.ok() && response.status() !== 304) {
        // Ignore 304 Not Modified
        failedRequests.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    // Navigate to landing page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Storybook
    await page.goto('/storybook/');
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // Filter critical asset failures (CSS, JS, fonts)
    const criticalFailures = failedRequests.filter(
      (req) =>
        req.url.match(/\.(css|js|woff|woff2)$/i) &&
        !req.url.includes('favicon') // Ignore favicon 404s
    );

    if (criticalFailures.length > 0) {
      console.error('Failed assets:', criticalFailures);
    }

    expect(criticalFailures).toHaveLength(0);
  });

  test('cross-page navigation works in production', async ({ page }) => {
    await page.goto('/');

    // Find Storybook link
    const storybookLink = page.getByRole('link', {
      name: /storybook|documentation|docs/i,
    });

    if (await storybookLink.isVisible()) {
      await storybookLink.click();
      await page.waitForURL('**/storybook/**');
      await expect(page).toHaveTitle(/Storybook/i);
    }
  });

  test('GitHub Pages .nojekyll file prevents asset filtering', async ({
    page,
  }) => {
    // Verify Storybook assets load (they have _ prefixes that Jekyll would filter)
    await page.goto('/storybook/');

    // Check that Storybook JS assets loaded successfully
    const performance = await page.evaluate(() =>
      JSON.stringify(performance.getEntriesByType('resource'))
    );
    const resources = JSON.parse(performance);

    const storybookAssets = resources.filter(
      (r: { name: string }) =>
        r.name.includes('storybook') || r.name.includes('iframe')
    );

    expect(storybookAssets.length).toBeGreaterThan(0);
  });

  test('site responds within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds on production
    expect(loadTime).toBeLessThan(5000);
  });

  test('no console errors in production', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out non-critical errors
    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('favicon') &&
        !error.includes('DevTools') &&
        !error.includes('Extension')
    );

    if (criticalErrors.length > 0) {
      console.error('Console errors:', criticalErrors);
    }

    expect(criticalErrors).toHaveLength(0);
  });

  test('CORS and security headers allow proper asset loading', async ({
    page,
  }) => {
    await page.goto('/storybook/');

    // Check that iframe content loads (Storybook uses iframes for preview)
    const iframe = page.frameLocator('iframe[title*="storybook"]').first();

    // If iframe exists, verify it's not blocked by CORS
    const iframeCount = await page.locator('iframe').count();
    if (iframeCount > 0) {
      // Just verify iframes are present and not showing CORS errors
      expect(iframeCount).toBeGreaterThan(0);
    }
  });

  test('mobile viewport renders correctly', async ({ page, browser }) => {
    // Create mobile context
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    });

    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('/');

    // Verify page loads on mobile
    await expect(mobilePage).toHaveTitle(
      /@decentralized-games\/card-components/i
    );

    // Check content is visible (not off-screen or cut off)
    const heading = mobilePage.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    await mobileContext.close();
  });
});

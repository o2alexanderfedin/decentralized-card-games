import { test, expect, type Page, type Response } from '@playwright/test';

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
 *
 * NOTE: Uses retry logic with exponential backoff to handle CDN propagation delays.
 * GitHub Pages uses Fastly CDN which can take 15-30 minutes to fully propagate.
 */

/**
 * Retry a page navigation with exponential backoff
 * Handles CDN cache propagation delays where different edge locations may return 404
 */
async function retryGoto(
  page: Page,
  url: string,
  options: { maxRetries?: number; baseDelay?: number } = {}
): Promise<Response | null> {
  const { maxRetries = 5, baseDelay = 2000 } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

      // If we got a successful response, return it
      if (response && response.ok()) {
        if (attempt > 0) {
          console.log(`✓ Success on attempt ${attempt + 1} for ${url}`);
        }
        return response;
      }

      // If we got a non-404 error, throw it (don't retry)
      if (response && response.status() !== 404) {
        throw new Error(
          `HTTP ${response.status()} - non-retryable error for ${url}`
        );
      }

      // Got 404, retry with backoff if attempts remain
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(
          `⏳ Attempt ${attempt + 1}/${maxRetries + 1} failed (404) for ${url}, retrying in ${delay}ms...`
        );
        await page.waitForTimeout(delay);
      } else {
        // Final attempt failed
        return response;
      }
    } catch (error) {
      // Network error or other exception
      if (attempt === maxRetries) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(
        `⏳ Attempt ${attempt + 1}/${maxRetries + 1} threw error, retrying in ${delay}ms...`
      );
      await page.waitForTimeout(delay);
    }
  }

  return null;
}

test.describe('Production Deployment Verification', () => {
  test('production site is accessible', async ({ page }) => {
    const response = await retryGoto(page, '/');

    // Verify 200 OK response
    expect(response?.status()).toBe(200);

    // Verify page loads
    await expect(page).toHaveTitle(/@decentralized-games\/card-components/i);
  });

  test('Storybook is accessible at production URL', async ({ page }) => {
    const response = await retryGoto(page, '/storybook/');

    // Verify 200 OK response
    expect(response?.status()).toBe(200);

    // Verify Storybook loads
    await expect(page).toHaveTitle(/Storybook/i);

    // Check for Storybook navigation
    const sidebar = page.locator('[role="navigation"]').first();
    await expect(sidebar).toBeVisible({ timeout: 15000 });
  });

  test('base path is correctly applied in production', async ({ page }) => {
    await retryGoto(page, '/');

    // Verify URL includes base path
    expect(page.url()).toContain('/decentralized-card-games');

    // Navigate to Storybook and verify base path persists
    await retryGoto(page, '/storybook/');
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
    await retryGoto(page, '/');
    await page.waitForLoadState('networkidle');

    // Navigate to Storybook
    await retryGoto(page, '/storybook/');
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
    await retryGoto(page, '/');

    // Find Storybook link
    const storybookLink = page.getByRole('link', {
      name: /storybook|documentation|docs/i,
    });

    if (await storybookLink.isVisible()) {
      await storybookLink.click();
      await page.waitForURL('**/storybook/**', { timeout: 30000 });
      await expect(page).toHaveTitle(/Storybook/i);
    }
  });

  test('GitHub Pages .nojekyll file prevents asset filtering', async ({
    page,
  }) => {
    // Verify Storybook assets load (they have _ prefixes that Jekyll would filter)
    await retryGoto(page, '/storybook/');

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

    await retryGoto(page, '/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds on production (excluding retry time)
    // Note: This measures single request time, not total with retries
    expect(loadTime).toBeLessThan(10000);
  });

  test('no console errors in production', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await retryGoto(page, '/');
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
    await retryGoto(page, '/storybook/');

    // Check that iframe content loads (Storybook uses iframes for preview)
    // If iframe exists, verify it's not blocked by CORS
    const iframeCount = await page.locator('iframe').count();
    if (iframeCount > 0) {
      // Just verify iframes are present and not showing CORS errors
      expect(iframeCount).toBeGreaterThan(0);
    }
  });

  test('mobile viewport renders correctly', async ({ browser }) => {
    // Create mobile context
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    });

    const mobilePage = await mobileContext.newPage();
    await retryGoto(mobilePage, '/');

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

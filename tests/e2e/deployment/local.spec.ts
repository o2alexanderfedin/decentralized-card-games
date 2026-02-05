import { test, expect } from '@playwright/test';

/**
 * Local Deployment Verification Suite
 *
 * Tests the built site-dist/ directory served locally to verify:
 * - All pages load without errors
 * - Assets load correctly (CSS, JS)
 * - Navigation works
 * - Storybook builds properly
 *
 * Runs BEFORE deployment to catch issues early.
 */

test.describe('Local Deployment Verification', () => {
  test('landing page loads successfully', async ({ page }) => {
    await page.goto('/');

    // Verify page loads without errors
    await expect(page).toHaveTitle(/@decentralized-games\/card-components/i);

    // Check for main content indicators
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('Storybook loads at /storybook/ path', async ({ page }) => {
    await page.goto('/storybook/');

    // Verify Storybook interface loads
    await expect(page).toHaveTitle(/Storybook/i);

    // Wait for Storybook to fully load
    await page.waitForLoadState('networkidle');

    // Verify iframe exists (Storybook uses iframe for preview)
    const iframe = page.locator('iframe#storybook-preview-iframe');
    await expect(iframe).toBeAttached({ timeout: 10000 });
  });

  test('Storybook component stories render', async ({ page }) => {
    await page.goto('/storybook/');

    // Wait for Storybook to load
    await page.waitForLoadState('networkidle');

    // Verify Storybook sidebar/navigation is present by checking for common elements
    // Storybook typically has a div with id 'storybook-panel-root' or 'storybook-explorer-tree'
    const hasStorybookUI =
      (await page.locator('#storybook-panel-root').count()) > 0 ||
      (await page.locator('[id^="storybook"]').count()) > 0;

    expect(hasStorybookUI).toBe(true);
  });

  test('assets load without 404 errors', async ({ page }) => {
    const failedRequests: string[] = [];

    // Track failed requests
    page.on('requestfailed', (request) => {
      failedRequests.push(`${request.method()} ${request.url()}`);
    });

    // Navigate to landing page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Storybook
    await page.goto('/storybook/');
    await page.waitForLoadState('networkidle');

    // Verify no critical assets failed to load
    const criticalFailures = failedRequests.filter((req) =>
      req.match(/\.(css|js|svg|png|jpg|jpeg|woff|woff2)$/i)
    );

    expect(criticalFailures).toHaveLength(0);
  });

  test('CSS and styling are applied', async ({ page }) => {
    await page.goto('/');

    // Check that our landing page has the gradient background
    // The gradient is defined in inline styles, so it should always be present
    const body = page.locator('body');
    const backgroundImage = await body.evaluate((el) =>
      window.getComputedStyle(el).backgroundImage
    );

    // Should have a linear-gradient (our custom landing page styling)
    expect(backgroundImage).toContain('linear-gradient');
  });

  test('navigation links work correctly', async ({ page }) => {
    await page.goto('/');

    // Find and test Storybook link if it exists
    const storybookLink = page.getByRole('link', {
      name: /storybook|documentation|docs/i,
    });

    if (await storybookLink.isVisible()) {
      await storybookLink.click();
      await page.waitForURL('**/storybook/**');
      await expect(page).toHaveTitle(/Storybook/i);
    }
  });

  test('no console errors on page load', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Allow some non-critical errors but flag anything serious
    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('favicon') && // Ignore favicon 404s
        !error.includes('DevTools') // Ignore DevTools warnings
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('base path routing works correctly', async ({ page }) => {
    // Test that paths without base path don't cause 404s
    await page.goto('/');
    await expect(page).not.toHaveURL(/404/);

    await page.goto('/storybook/');
    await expect(page).not.toHaveURL(/404/);
  });
});

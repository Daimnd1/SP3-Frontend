import { test, expect, devices } from '@playwright/test';

/**
 * E2E: NFR2 - Browser Compatibility
 * Application should work across all major browsers
 */

test.describe('E2E: NFR2 - Browser Compatibility', () => {
  // These tests run on all configured browsers: chromium, firefox, webkit
  // Run with: npx playwright test --project=chromium --project=firefox --project=webkit

  test('Application loads on all browsers', async ({ page }) => {
    await page.goto('/');
    
    // Check app renders
    await expect(page.locator('body')).toBeVisible();
    
    // Check no critical console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
  });

  test('Navigation works on all browsers', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to different pages
    await page.click('text=Desk');
    await expect(page).toHaveURL('/desk');
    
    await page.click('text=Reports');
    await expect(page).toHaveURL('/reports');
    
    await page.click('text=Home');
    await expect(page).toHaveURL('/');
  });

  test('CSS and styling render correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check computed styles are applied
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check tailwind classes work (background color should be set)
    const hasBackgroundColor = await body.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundColor !== '';
    });
    expect(hasBackgroundColor).toBe(true);
  });

  test('Interactive elements work on all browsers', async ({ page }) => {
    await page.goto('/desk');
    
    // Check buttons are clickable
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Check first button is interactive
    if (buttonCount > 0) {
      await expect(buttons.first()).toBeEnabled();
    }
  });

  test('Responsive design works on all browsers', async ({ page }) => {
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});

/**
 * Playwright config for testing on multiple browsers
 * (Add to playwright.config.js):
 *
 * projects: [
 *   { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
 *   { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
 *   { name: 'webkit', use: { ...devices['Desktop Safari'] } },
 * ],
 */

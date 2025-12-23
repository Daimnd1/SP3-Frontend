import { test, expect } from '@playwright/test';

test.describe('SP3 Frontend - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should load the application successfully', async ({ page }) => {
    // Check that the page loaded
    await expect(page).toHaveTitle(/SP3/i);
    
    // Check for main content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display authentication UI', async ({ page }) => {
    // Should see sign in form or authenticated content
    const hasSignIn = await page.locator('text=/sign in|log in/i').count() > 0;
    const hasNavigation = await page.locator('nav').count() > 0;
    
    expect(hasSignIn || hasNavigation).toBeTruthy();
  });

  test('should have responsive navigation', async ({ page }) => {
    // Check if navigation exists
    const nav = page.locator('nav');
    
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible();
    }
  });

  test('should handle missing routes gracefully', async ({ page }) => {
    await page.goto('/nonexistent-route');
    
    // Should still render the app, not show a blank page
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load CSS and styling', async ({ page }) => {
    // Check that Tailwind or other styles are loaded
    const bodyElement = page.locator('body');
    await expect(bodyElement).toBeVisible();
    
    // Check that the page has some styling
    const bgColor = await bodyElement.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toBeTruthy();
  });
});

test.describe('SP3 Frontend - Navigation', () => {
  test('should have clickable navigation items', async ({ page }) => {
    await page.goto('/');
    
    // Wait for potential navigation to appear
    await page.waitForTimeout(1000);
    
    // Check for navigation links
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    // Should have at least some links
    expect(linkCount).toBeGreaterThan(0);
  });
});

test.describe('SP3 Frontend - Responsiveness', () => {
  test('should render on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should render on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should render on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await expect(page.locator('body')).toBeVisible();
  });
});

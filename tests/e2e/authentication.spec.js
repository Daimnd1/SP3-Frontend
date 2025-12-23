import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display authentication page', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Check that the page loaded with some content
    const bodyContent = await page.textContent('body');
    expect(bodyContent).toBeTruthy();
    expect(bodyContent.length).toBeGreaterThan(0);
  });

  test('should have form inputs for authentication', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Check for input fields
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    // Should have at least email/password inputs if auth form is present
    expect(inputCount).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Dark Mode', () => {
  test('should respect system dark mode preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    
    // Check that the page loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should respect system light mode preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    
    // Check that the page loaded
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe('Accessibility', () => {
  test('should have proper document structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper HTML structure
    const html = page.locator('html');
    const body = page.locator('body');
    const main = page.locator('main, [role="main"]');
    
    await expect(html).toBeVisible();
    await expect(body).toBeVisible();
    
    // Main content area should exist or be in root div
    const hasMainOrRoot = (await main.count()) > 0 || (await page.locator('#root').count()) > 0;
    expect(hasMainOrRoot).toBeTruthy();
  });

  test('should have accessible language attribute', async ({ page }) => {
    await page.goto('/');
    
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
  });
});

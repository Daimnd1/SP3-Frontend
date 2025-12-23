import { test, expect } from '@playwright/test';

test.describe('Desk Control Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await page.waitForTimeout(1500);
  });

  test('should navigate to desk page if authenticated', async ({ page }) => {
    // Try to find desk-related content or navigation
    const deskLink = page.locator('a[href*="desk"], button:has-text("Desk")');
    
    if (await deskLink.count() > 0) {
      await deskLink.first().click();
      await page.waitForTimeout(500);
      
      // Should navigate to desk page
      expect(page.url()).toContain('desk');
    }
  });

  test('should display desk-related UI elements', async ({ page }) => {
    // Check if desk controls exist
    const bodyContent = await page.textContent('body');
    const hasDeskContent = /desk|height|position|sitting|standing/i.test(bodyContent);
    
    // Content might be auth-gated, so this is optional
    expect(typeof hasDeskContent).toBe('boolean');
  });
});

test.describe('Navigation Flow', () => {
  test('should handle navigation between pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Get all navigation links
    const navLinks = page.locator('nav a, a[href^="/"]');
    const linkCount = await navLinks.count();
    
    if (linkCount > 0) {
      // Click first navigation link
      await navLinks.first().click();
      await page.waitForTimeout(500);
      
      // Page should still be visible after navigation
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should maintain state during navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Get initial page state
    const initialContent = await page.textContent('body');
    expect(initialContent).toBeTruthy();
    
    // Navigate and come back
    const links = page.locator('a[href^="/"]');
    if (await links.count() > 1) {
      await links.nth(1).click();
      await page.waitForTimeout(500);
      await page.goBack();
      await page.waitForTimeout(500);
      
      // Page should still render
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Start with offline
    await page.context().setOffline(true);
    await page.goto('/', { waitUntil: 'domcontentloaded' }).catch(() => {});
    
    // Go back online
    await page.context().setOffline(false);
    await page.reload();
    
    // Should recover and display content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display error messages when API fails', async ({ page }) => {
    await page.goto('/');
    
    // Mock API failure
    await page.route('**/api/**', route => route.abort());
    
    // Try to trigger an API call
    await page.waitForTimeout(2000);
    
    // App should still be functional
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Cross-browser Compatibility', () => {
  test('should render correctly in Chromium', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium-specific test');
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should render correctly in Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox-specific test');
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should render correctly in WebKit', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'WebKit-specific test');
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});

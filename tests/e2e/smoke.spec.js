/**
 * E2E Smoke Tests - Simple tests to verify the app loads and basic navigation works
 * 
 * Requirements Coverage:
 * - FR1: Desk control page accessible
 * - FR5: Reports page accessible
 * - NFR1: App responsive on desktop
 * - NFR2: Works in major browsers
 */

import { test, expect } from '@playwright/test';

test.describe('E2E Smoke Tests', () => {
  
  test('App loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page loaded
    await expect(page).toHaveTitle(/sp3-frontend|DeskApp/i);
    
    // Check main content is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('Navigation to all main pages works', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Desk page
    await page.goto('/desk');
    await expect(page).toHaveURL('/desk');
    await expect(page.locator('body')).toBeVisible();
    
    // Navigate to Reports page
    await page.goto('/reports');
    await expect(page).toHaveURL('/reports');
    await expect(page.locator('body')).toBeVisible();
    
    // Navigate to Configuration page
    await page.goto('/configuration');
    await expect(page).toHaveURL('/configuration');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Desk page displays main content', async ({ page }) => {
    await page.goto('/desk');
    
    // Check page has content (any text or buttons)
    const hasContent = await page.locator('button, input, h1, h2, p').count() > 0;
    expect(hasContent).toBe(true);
  });

  test('Reports page displays main content', async ({ page }) => {
    await page.goto('/reports');
    
    // Check page has content
    const hasContent = await page.locator('button, h1, h2, p, svg').count() > 0;
    expect(hasContent).toBe(true);
  });

  test('App works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Check page loaded and is responsive
    await expect(page.locator('body')).toBeVisible();
    
    // Navigate to desk page on mobile
    await page.goto('/desk');
    await expect(page).toHaveURL('/desk');
  });
});

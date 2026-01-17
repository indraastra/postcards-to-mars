import { test, expect } from '@playwright/test';

test('landing page has title and header', async ({ page }) => {
    await page.goto('/');

    // Check title (case insensitive)
    await expect(page).toHaveTitle(/Postcards To Mars/i);

    // Check header elements
    await expect(page.locator('header')).toBeVisible();

    // Check that the gallery is present
    await expect(page.locator('app-destination-gallery')).toBeVisible();

    // Check that FilmStrip is NOT present on landing
    await expect(page.locator('app-film-strip')).not.toBeVisible();

    // Check for specific text that confirms strict UI preservation
    await expect(page.locator('body')).toContainText('INFO');
    await expect(page.locator('body')).toContainText('RESET');
});

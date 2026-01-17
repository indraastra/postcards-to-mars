import { test, expect } from '@playwright/test';

test.describe('Postcards to Mars Flows', () => {

    test('full flow: upload -> poem -> result -> theme switch', async ({ page }) => {
        // 1. Landing
        await page.goto('/');
        await expect(page).toHaveTitle(/Postcards To Mars/i);

        // Mock the file upload by injecting a dummy image into the Store directly 
        // OR simlulating the file input. 
        // Since we don't have a file handy in the repo, let's try to simulate the data.
        // Actually, we can use a buffer for file upload simulation in Playwright.

        // Create a dummy image buffer (1x1 pixel)
        const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

        // Trigger upload
        // The input is likely hidden or inside the DestinationGalleryComponent.
        // Let's find the input. It might be inside the component template.
        // Based on previous code, LandingComponent wraps DestinationGalleryComponent.
        // DestinationGalleryComponent has the upload logic.

        // We need to ensure the input is attached.
        // Let's assume there's an input[type="file"].
        // Target the second input (Archive/Upload) 
        const fileInput = page.locator('input[type="file"]').nth(1);
        await fileInput.setInputFiles({
            name: 'test.jpg',
            mimeType: 'image/jpeg',
            buffer: buffer
        });

        // 2. Analyzing -> Dialogue
        // Should navigate to /analyzing then /compose
        // This depends on the real Gemini API response.
        // Since we can't easily mock the API in E2E without intercepting requests,
        // and this is a "live" test, it might fail if API key is missing or quotas.
        // However, the user wants us to "bolster with tests".
        // 
        // If we assume the app is running with an API key (it is), we can try.
        // But waiting for "Analyzing" might take time.

        await expect(page).toHaveURL(/\/compose/, { timeout: 30000 });

        // 3. Dialogue Interaction
        // Wait for starter text "Today I..." (or whatever the theme is)
        await expect(page.locator('app-dialogue')).toBeVisible();

        // Click suggestions to proceed
        // Line 1
        await page.locator('app-dialogue button').first().click();
        // Line 2
        await page.locator('app-dialogue button').first().click();
        // Line 3
        await page.locator('app-dialogue button').first().click();

        // 4. Generating -> Result
        await expect(page).toHaveURL(/\/result/, { timeout: 60000 });

        // 5. Verify Poem Formatting
        const poemText = await page.locator('app-postcard-result div.text-lg').textContent();
        expect(poemText).not.toContain('\\n'); // Should NOT have literal \n

        // 6. Theme Switching
        // Click a fake film strip item (assuming they are visible in result)
        // The film strip is in the result wrapper.
        const thumb = page.locator('app-film-strip button').nth(1); // Click the second one (switching theme)
        await thumb.click();

        // It triggers "onThemeSwitched", which does "analyze -> generate"
        // This is async. It might update the poem in place.
        // Wait for some change or loading.

        // Verify the new poem doesn't have escaped newlines
        // We might need to wait a bit for regeneration.
        await page.waitForTimeout(5000); // Wait for API

        const newPoemText = await page.locator('app-postcard-result p').textContent();
        expect(newPoemText).not.toContain('\\n');
    });
});

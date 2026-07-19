import { test, expect } from '@playwright/test';

test.describe('Indian Recipe Generator UI', () => {
  test('should load the app and generate recipes correctly', async ({ page }) => {
    // 1. Navigate to the app
    await page.goto('/');

    // 2. Verify header text
    await expect(page.locator('h1')).toHaveText('Indian Recipe Generator');

    // 3. Fill the search input
    await page.fill('#search-input', 'paneer, spinach');

    // 4. Click the submit button
    await page.click('#submit-button');

    // 5. Verify the loading state displays then hides
    // Since mock service is instant, we just wait for results section to be visible
    const results = page.locator('#results-section');
    await expect(results).toBeVisible();

    // 6. Verify exactly 5 recipes are displayed
    const recipeItems = page.locator('#recipes-list .recipe-item');
    await expect(recipeItems).toHaveCount(5);

    // 7. Verify the first recipe contains Palak Paneer
    await expect(recipeItems.first()).toContainText('Palak Paneer');
  });
});

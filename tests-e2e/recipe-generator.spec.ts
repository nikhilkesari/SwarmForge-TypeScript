import { test, expect } from '@playwright/test';

test.describe('Indian Recipe Generator UI', () => {
  test('should generate recipes and auto-fetch on diet toggle', async ({ page }) => {
    // 1. Navigate to the app
    await page.goto('/?mock=true');

    // 2. Verify header text
    await expect(page.locator('h1')).toHaveText('Indian Recipe Generator');

    // 3. Fill the search input with a mixed ingredients query
    await page.fill('#search-input', 'paneer, chicken');

    // 4. Click the submit button with "All" selected
    await page.click('#submit-button');

    // 5. Verify the results section is visible and contains 5 recipes (All)
    const results = page.locator('#results-section');
    await expect(results).toBeVisible();
    const recipeItems = page.locator('#recipes-list .recipe-item');
    await expect(recipeItems).toHaveCount(5);
    await expect(recipeItems.nth(0)).toContainText('Butter Chicken');

    // 6. Toggle to "Veg" - should trigger auto-fetch and return 5 vegetarian recipes
    await page.click('.diet-toggle-btn[data-diet="Veg"]');
    await expect(recipeItems).toHaveCount(5);
    await expect(recipeItems.nth(0)).toContainText('Palak Paneer');
    await expect(recipeItems.nth(1)).toContainText('Paneer Tikka');

    // 7. Toggle to "Non-Veg" - should trigger auto-fetch and return 5 non-vegetarian recipes
    await page.click('.diet-toggle-btn[data-diet="Non-Veg"]');
    await expect(recipeItems).toHaveCount(5);
    await expect(recipeItems.nth(0)).toContainText('Butter Chicken');
    await expect(recipeItems.nth(1)).toContainText('Chicken Biryani');

    // 8. Verify the active toggle button holds its state
    const activeBtn = page.locator('.diet-toggle-btn.active');
    await expect(activeBtn).toHaveAttribute('data-diet', 'Non-Veg');

    // 9. Click "Get Recipe" for Butter Chicken (first item)
    const getRecipeBtn = recipeItems.nth(0).locator('.get-recipe-btn');
    await getRecipeBtn.click();
    const detailsSection = page.locator('#recipe-details-section');
    await expect(detailsSection).toBeVisible();
  });

  test('should display empty state when fetching for incompatible diet', async ({ page }) => {
    await page.goto('/?mock=true');

    // 1. Enter "potato, cumin"
    await page.fill('#search-input', 'potato, cumin');

    // 2. Click "Non-Veg" toggle - should immediately fetch and return empty list
    await page.click('.diet-toggle-btn[data-diet="Non-Veg"]');

    // 3. Verify results section is displayed but recipe list is empty and empty message is visible
    const recipeItems = page.locator('#recipes-list .recipe-item');
    await expect(recipeItems).toHaveCount(0);

    const emptyMsg = page.locator('#filter-empty-message');
    await expect(emptyMsg).toBeVisible();
    await expect(emptyMsg).toHaveText('No recipes matching Non-Veg Only found.');
  });
});

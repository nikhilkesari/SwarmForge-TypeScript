import { test, expect } from '@playwright/test';

test.describe('Indian Recipe Generator UI', () => {
  test('should load the app and generate recipes correctly', async ({ page }) => {
    // 1. Navigate to the app
    await page.goto('/?mock=true');

    // 2. Verify header text
    await expect(page.locator('h1')).toHaveText('Indian Recipe Generator');

    // 3. Fill the search input with a mixed ingredients query
    await page.fill('#search-input', 'paneer, chicken');

    // 4. Click the submit button
    await page.click('#submit-button');

    // 5. Verify the loading state displays then hides
    const results = page.locator('#results-section');
    await expect(results).toBeVisible();

    // 6. Verify exactly 5 recipes are displayed initially
    const recipeItems = page.locator('#recipes-list .recipe-item');
    await expect(recipeItems).toHaveCount(5);
    await expect(recipeItems.nth(0)).toContainText('Butter Chicken');
    await expect(recipeItems.nth(1)).toContainText('Palak Paneer');

    // 7. Toggle filter to "Veg" and verify filtered list
    await page.selectOption('#diet-filter', 'Veg');
    await expect(recipeItems).toHaveCount(2);
    await expect(recipeItems.nth(0)).toContainText('Palak Paneer');
    await expect(recipeItems.nth(1)).toContainText('Paneer Tikka');

    // 8. Toggle filter to "Non-Veg" and verify filtered list
    await page.selectOption('#diet-filter', 'Non-Veg');
    await expect(recipeItems).toHaveCount(3);
    await expect(recipeItems.nth(0)).toContainText('Butter Chicken');
    await expect(recipeItems.nth(1)).toContainText('Chicken Biryani');
    await expect(recipeItems.nth(2)).toContainText('Chicken Curry');

    // 9. Toggle filter back to "All" and verify list is fully restored
    await page.selectOption('#diet-filter', 'All');
    await expect(recipeItems).toHaveCount(5);

    // 10. Click the "Get Recipe" button for a recipe
    const getRecipeBtn = recipeItems.nth(1).locator('.get-recipe-btn'); // Palak Paneer
    await getRecipeBtn.click();

    // 11. Verify the details section is displayed with the correct content
    const detailsSection = page.locator('#recipe-details-section');
    await expect(detailsSection).toBeVisible();
    await expect(page.locator('#recipe-details-title')).toHaveText('Palak Paneer Details');
    await expect(page.locator('#recipe-details-content')).toContainText('Paneer, Spinach');
  });
});

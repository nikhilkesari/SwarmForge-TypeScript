import { describe, test, expect, vi, beforeEach } from 'vitest';
import { IndianRecipeGeneratorApp, MockRecipeService, GeminiRecipeService } from './recipe-generator';

describe('MockRecipeService', () => {
  const service = new MockRecipeService();

  test('returns paneer recipes when query contains paneer', async () => {
    const results = await service.getRecipes('paneer');
    expect(results).toContain('Palak Paneer');
    expect(results.length).toBe(5);
  });

  test('returns potato recipes when query contains potato', async () => {
    const results = await service.getRecipes('potato');
    expect(results).toContain('Aloo Jeera');
    expect(results.length).toBe(5);
  });

  test('returns fallback recipes for unknown inputs', async () => {
    const results = await service.getRecipes('chicken');
    expect(results).toContain('Butter Chicken');
    expect(results.length).toBe(5);
  });
});

describe('IndianRecipeGeneratorApp', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  test('initializes UI markup correctly on init()', () => {
    const service = new MockRecipeService();
    const app = new IndianRecipeGeneratorApp(container, service);
    app.init();

    expect(container.querySelector('h1')?.textContent).toBe('Indian Recipe Generator');
    expect(container.querySelector('#search-input')).toBeDefined();
    expect(container.querySelector('#submit-button')).toBeDefined();
  });

  test('handles form submission and displays recipes', async () => {
    const service = new MockRecipeService();
    const app = new IndianRecipeGeneratorApp(container, service);
    app.init();

    const form = container.querySelector('#search-form') as HTMLFormElement;
    const input = container.querySelector('#search-input') as HTMLInputElement;

    input.value = 'paneer';
    
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    // Wait for the async search operation to complete
    await new Promise((resolve) => setTimeout(resolve, 60));

    const recipeItems = container.querySelectorAll('#recipes-list .recipe-item .recipe-name');
    expect(recipeItems.length).toBe(5);
    expect(recipeItems[0].textContent).toBe('Palak Paneer');
  });
});

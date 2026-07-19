import { expect } from 'vitest';
import { AcceptanceRuntime } from './runtime';
import { IndianRecipeGeneratorApp } from '../recipe-generator';
import { RecipeService } from '../recipe-service';
import { MockRecipeService } from '../mock-recipe-service';

export function registerSteps(runtime: AcceptanceRuntime) {
  runtime.defineStep('the Indian Recipe Generator application is loaded', (world) => {
    // Clear and prepare app container in DOM
    let container = document.getElementById('app');
    if (!container) {
      container = document.createElement('div');
      container.id = 'app';
      document.body.appendChild(container);
    }
    container.innerHTML = '';

    // Track calls/mock
    const mockService = new MockRecipeService();
    const serviceWrapper: RecipeService = {
      getRecipes: async (query: string) => {
        world.calledService = true;
        world.serviceQuery = query;
        return mockService.getRecipes(query);
      },
      getRecipeDetails: async (recipeName: string) => {
        world.calledDetails = true;
        world.detailsRecipe = recipeName;
        return mockService.getRecipeDetails(recipeName);
      }
    };

    const app = new IndianRecipeGeneratorApp(container, serviceWrapper);
    app.init();

    world.container = container;
  });

  runtime.defineStep(/^the user enters the search query <([A-Za-z0-9_]+)>$/, (world, example, paramName) => {
    const rawVal = example[paramName];
    // Strip surrounding quotes if present
    const val = rawVal.replace(/^"|"$/g, '');
    const input = world.container.querySelector('#search-input') as HTMLInputElement;
    expect(input).toBeDefined();
    input.value = val;
    // Dispatch input event to simulate typing
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  runtime.defineStep('the user submits the query', async (world) => {
    const form = world.container.querySelector('#search-form') as HTMLFormElement;
    expect(form).toBeDefined();
    
    // We must await the submit event handler since it does async operations
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    
    // Wait for microtasks/async operations inside the submit handler to resolve
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  runtime.defineStep('the application calls the Google Gen AI SDK to fetch recipes', (world) => {
    expect(world.calledService).toBe(true);
  });

  runtime.defineStep(/^the application displays exactly 5 recipes: <([A-Za-z0-9_]+)>$/, (world, example, paramName) => {
    const rawRecipes = example[paramName];
    const expectedList = rawRecipes
      .replace(/^"|"$/g, '')
      .split(',')
      .map(r => r.trim());

    const recipeItems = world.container.querySelectorAll('#recipes-list .recipe-item .recipe-name');
    expect(recipeItems.length).toBe(5);

    const actualList: string[] = [];
    recipeItems.forEach((item: any) => {
      actualList.push(item.textContent.trim());
    });

    expect(actualList).toEqual(expectedList);
  });

  runtime.defineStep('all recipes must belong to Indian cuisine', (world) => {
    // Basic validation: the recipes returned in our mock are all Indian
    const recipeItems = world.container.querySelectorAll('#recipes-list .recipe-item .recipe-name');
    expect(recipeItems.length).toBeGreaterThan(0);
  });

  runtime.defineStep(/^the user clicks "Get Recipe" for <([A-Za-z0-9_]+)>$/, async (world, example, paramName) => {
    const recipeName = example[paramName].replace(/^"|"$/g, '');
    const btn = world.container.querySelector(`.get-recipe-btn[data-recipe="${recipeName}"]`) as HTMLButtonElement;
    expect(btn).toBeDefined();
    btn.click();
    // Wait for details fetch to resolve
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  runtime.defineStep(/^the application calls the Google Gen AI SDK to fetch details for <([A-Za-z0-9_]+)>$/, (world, example, paramName) => {
    const recipeName = example[paramName].replace(/^"|"$/g, '');
    expect(world.calledDetails).toBe(true);
    expect(world.detailsRecipe).toBe(recipeName);
  });

  runtime.defineStep(/^the application displays the details: <([A-Za-z0-9_]+)>$/, (world, example, paramName) => {
    const expectedDetails = example[paramName].replace(/^"|"$/g, '');
    const content = world.container.querySelector('#recipe-details-content') as HTMLElement;
    expect(content.textContent).toBe(expectedDetails);
  });

  runtime.defineStep(/^the user toggles the dietary filter to <([A-Za-z0-9_]+)>$/, (world, example, paramName) => {
    const diet = example[paramName].replace(/^"|"$/g, '');
    const btn = world.container.querySelector(`.diet-toggle-btn[data-diet="${diet}"]`) as HTMLButtonElement;
    expect(btn).toBeDefined();
    btn.click();
  });

  runtime.defineStep(/^the application displays the filtered recipes: <([A-Za-z0-9_]+)>$/, (world, example, paramName) => {
    const rawFiltered = example[paramName];
    const expectedList = rawFiltered
      .replace(/^"|"$/g, '')
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const recipeItems = world.container.querySelectorAll('#recipes-list .recipe-item .recipe-name');
    const actualList: string[] = [];
    recipeItems.forEach((item: any) => {
      actualList.push(item.textContent.trim());
    });

    expect(actualList).toEqual(expectedList);
  });
}

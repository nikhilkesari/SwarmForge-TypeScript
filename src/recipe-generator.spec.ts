import { describe, test, expect, vi, beforeEach } from 'vitest';
import { IndianRecipeGeneratorApp } from './recipe-generator';
import { GeminiRecipeService, parseAndValidateRecipes, isVegRecipe } from './recipe-service';
import { MockRecipeService } from './mock-recipe-service';

vi.mock('@google/genai', () => {
  const generateContentMock = vi.fn();
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: generateContentMock,
      },
    })),
  };
});

describe('parseAndValidateRecipes', () => {
  test('correctly parses JSON array of strings', () => {
    const json = '["Aloo Jeera", "Aloo Gobi"]';
    expect(parseAndValidateRecipes(json)).toEqual(['Aloo Jeera', 'Aloo Gobi']);
  });

  test('strips markdown code blocks and trims whitespace', () => {
    const md = '```json\n["Aloo Jeera"]\n```';
    expect(parseAndValidateRecipes(md)).toEqual(['Aloo Jeera']);
  });

  test('throws error for invalid json', () => {
    expect(() => parseAndValidateRecipes('not-json')).toThrow();
  });

  test('throws error for non-array responses', () => {
    expect(() => parseAndValidateRecipes('{"recipes": []}')).toThrow();
  });

  test('throws error if array elements are not strings', () => {
    expect(() => parseAndValidateRecipes('[1, 2, 3]')).toThrow();
  });

  test('property test: correctly parses any valid random string array of length 0 to 10', () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
    const generateRandomString = (len: number) => {
      let result = '';
      for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return result;
    };

    // Run 100 iterations of randomized string array inputs
    for (let run = 0; run < 100; run++) {
      const arrLength = Math.floor(Math.random() * 11);
      const inputArr: string[] = [];
      for (let i = 0; i < arrLength; i++) {
        inputArr.push(generateRandomString(Math.floor(Math.random() * 15) + 1));
      }

      const jsonString = JSON.stringify(inputArr);
      // Randomly wrap in markdown json block
      const shouldWrap = Math.random() > 0.5;
      const formatted = shouldWrap ? `\`\`\`json\n${jsonString}\n\`\`\`` : jsonString;

      const parsed = parseAndValidateRecipes(formatted);
      const expected = inputArr.slice(0, 5);
      expect(parsed).toEqual(expected);
    }
  });
});

describe('GeminiRecipeService', () => {
  test('calls generateContent and returns parsed recipes', async () => {
    const service = new GeminiRecipeService('dummy-key');
    const clientInstance = (service as any).ai;
    
    clientInstance.models.generateContent.mockResolvedValueOnce({
      text: '["Chole Bhature", "Paneer Tikka"]'
    });

    const result = await service.getRecipes('paneer');
    expect(clientInstance.models.generateContent).toHaveBeenCalledWith({
      model: 'gemini-3.5-flash',
      contents: expect.stringContaining('paneer'),
    });
    expect(result).toEqual(['Chole Bhature', 'Paneer Tikka']);
  });

  test('handles service errors by logging and rethrowing', async () => {
    const service = new GeminiRecipeService('dummy-key');
    const clientInstance = (service as any).ai;
    
    clientInstance.models.generateContent.mockRejectedValueOnce(new Error('Network error'));
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(service.getRecipes('paneer')).rejects.toThrow('Network error');
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test('calls generateContent and returns recipe details', async () => {
    const service = new GeminiRecipeService('dummy-key');
    const clientInstance = (service as any).ai;
    clientInstance.models.generateContent.mockResolvedValueOnce({
      text: 'Instructions for recipe'
    });
    const result = await service.getRecipeDetails('Palak Paneer');
    expect(result).toBe('Instructions for recipe');
  });
});

describe('isVegRecipe', () => {
  test('returns true for vegetarian recipes', () => {
    expect(isVegRecipe('Palak Paneer')).toBe(true);
    expect(isVegRecipe('Aloo Jeera')).toBe(true);
    expect(isVegRecipe('Dal Makhani')).toBe(true);
  });

  test('returns false for non-vegetarian recipes containing chicken, fish, mutton, etc.', () => {
    expect(isVegRecipe('Butter Chicken')).toBe(false);
    expect(isVegRecipe('Chicken Biryani')).toBe(false);
    expect(isVegRecipe('Fish Curry')).toBe(false);
    expect(isVegRecipe('Mutton Rogan Josh')).toBe(false);
  });
});

describe('MockRecipeService', () => {
  const service = new MockRecipeService();

  test('returns paneer and chicken recipes when query is paneer, chicken and diet is All', async () => {
    const results = await service.getRecipes('paneer, chicken');
    expect(results).toEqual(['Butter Chicken', 'Palak Paneer', 'Chicken Biryani', 'Paneer Tikka', 'Chicken Curry']);
  });

  test('diet: Veg, query: chicken returns empty array', async () => {
    const results = await service.getRecipes('chicken', 'Veg');
    expect(results).toEqual([]);
  });

  test('diet: Veg, query: paneer, spinach returns Veg recipes', async () => {
    const results = await service.getRecipes('paneer, spinach', 'Veg');
    expect(results).toEqual(['Palak Paneer', 'Paneer Tikka', 'Paneer Bhurji', 'Kadai Paneer', 'Matar Paneer']);
  });

  test('diet: Veg, query: other returns fallback Veg recipes', async () => {
    const results = await service.getRecipes('potato, cumin', 'Veg');
    expect(results).toEqual(['Chana Masala', 'Dal Makhani', 'Samosa', 'Aloo Gobi', 'Aloo Jeera']);
  });

  test('diet: Non-Veg, query: potato, cumin returns empty array', async () => {
    const results = await service.getRecipes('potato, cumin', 'Non-Veg');
    expect(results).toEqual([]);
  });

  test('diet: Non-Veg, query: chicken returns Non-Veg recipes', async () => {
    const results = await service.getRecipes('chicken', 'Non-Veg');
    expect(results).toEqual(['Butter Chicken', 'Chicken Biryani', 'Chicken Tikka', 'Chicken Korma', 'Chicken Curry']);
  });

  test('diet: Non-Veg, query: other returns fallback Non-Veg recipes', async () => {
    const results = await service.getRecipes('some-other', 'Non-Veg');
    expect(results).toEqual(['Butter Chicken', 'Biryani', 'Chicken Curry', 'Mutton Rogan Josh', 'Fish Curry']);
  });

  test('returns paneer recipes when query contains paneer', async () => {
    const results = await service.getRecipes('paneer, spinach');
    expect(results).toContain('Palak Paneer');
    expect(results.length).toBe(5);
  });

  test('returns potato recipes when query contains potato', async () => {
    const results = await service.getRecipes('potato, cumin');
    expect(results).toContain('Aloo Jeera');
    expect(results.length).toBe(5);
  });

  test('returns fallback recipes for unknown inputs', async () => {
    const results = await service.getRecipes('unknown_ingredient');
    expect(results).toContain('Butter Chicken');
    expect(results.length).toBe(5);
  });

  test('returns Palak Paneer details', async () => {
    const result = await service.getRecipeDetails('Palak Paneer');
    expect(result).toContain('Paneer, Spinach');
  });

  test('returns Aloo Jeera details', async () => {
    const result = await service.getRecipeDetails('Aloo Jeera');
    expect(result).toContain('Potatoes, Cumin');
  });

  test('returns fallback details for other recipes', async () => {
    const result = await service.getRecipeDetails('Matar Paneer');
    expect(result).toContain('Ingredients and instructions for mock Matar Paneer');
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

    input.value = 'paneer, spinach';
    
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    // Wait for the async search operation to complete
    await new Promise((resolve) => setTimeout(resolve, 60));

    const recipeItems = container.querySelectorAll('#recipes-list .recipe-item .recipe-name');
    expect(recipeItems.length).toBe(5);
    expect(recipeItems[0].textContent).toBe('Palak Paneer');
  });

  test('handles Get Recipe button click and displays details', async () => {
    const service = new MockRecipeService();
    const app = new IndianRecipeGeneratorApp(container, service);
    app.init();

    const form = container.querySelector('#search-form') as HTMLFormElement;
    const input = container.querySelector('#search-input') as HTMLInputElement;

    input.value = 'paneer, spinach';
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    await new Promise((resolve) => setTimeout(resolve, 60));

    const btn = container.querySelector('.get-recipe-btn') as HTMLButtonElement;
    expect(btn).toBeDefined();
    btn.click();

    await new Promise((resolve) => setTimeout(resolve, 60));

    const content = container.querySelector('#recipe-details-content') as HTMLElement;
    expect(content.textContent).toContain('Paneer, Spinach');
  });

  test('filters recipe list by Veg and Non-Veg diet type when toggle is changed', async () => {
    const service = new MockRecipeService();
    const app = new IndianRecipeGeneratorApp(container, service);
    app.init();

    const form = container.querySelector('#search-form') as HTMLFormElement;
    const input = container.querySelector('#search-input') as HTMLInputElement;

    input.value = 'paneer, chicken';
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);

    await new Promise((resolve) => setTimeout(resolve, 60));

    // Initially should show all 5 recipes
    let items = container.querySelectorAll('#recipes-list .recipe-item .recipe-name');
    expect(items.length).toBe(5);

    // Toggle filter to Veg (using toggle buttons)
    // Gherkin scenario: "Filter already generated recipes dynamically"
    // The filter buttons are toggled.
    const select = container.querySelector('.diet-toggle-btn[data-diet="Veg"]') as HTMLButtonElement;
    expect(select).toBeDefined();
    
    // Change to Veg (without search query present, or mocking service responses)
    // In unit test context, let's just test UI logic by changing filter and checking rendered list
    // Note that since input.value is cleared or not, clicking the toggle triggers handleFetch.
    // If we want to test pure local filtering in unit test, we should clear input first.
    input.value = '';
    select.click();

    items = container.querySelectorAll('#recipes-list .recipe-item .recipe-name');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toBe('Palak Paneer');
    expect(items[1].textContent).toBe('Paneer Tikka');

    // Change to Non-Veg
    const selectNonVeg = container.querySelector('.diet-toggle-btn[data-diet="Non-Veg"]') as HTMLButtonElement;
    selectNonVeg.click();

    items = container.querySelectorAll('#recipes-list .recipe-item .recipe-name');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toBe('Butter Chicken');
    expect(items[1].textContent).toBe('Chicken Biryani');
    expect(items[2].textContent).toBe('Chicken Curry');

    // Change back to All
    const selectAll = container.querySelector('.diet-toggle-btn[data-diet="All"]') as HTMLButtonElement;
    selectAll.click();

    items = container.querySelectorAll('#recipes-list .recipe-item .recipe-name');
    expect(items.length).toBe(5);
  });

  describe('MockRecipeService', () => {
    test('MockRecipeService getRecipes and getRecipeDetails coverage', async () => {
      const mockService = new MockRecipeService();
      
      // Test all getRecipes keys to hit 100% branch coverage
      expect(await mockService.getRecipes('paneer, spinach', 'Veg')).toEqual(['Palak Paneer', 'Paneer Tikka', 'Paneer Bhurji', 'Kadai Paneer', 'Matar Paneer']);
      expect(await mockService.getRecipes('chicken', 'Veg')).toEqual([]);
      expect(await mockService.getRecipes('unknown', 'Veg')).toEqual(['Chana Masala', 'Dal Makhani', 'Samosa', 'Aloo Gobi', 'Aloo Jeera']);
      
      expect(await mockService.getRecipes('potato, cumin', 'Non-Veg')).toEqual([]);
      expect(await mockService.getRecipes('chicken', 'Non-Veg')).toEqual(['Butter Chicken', 'Chicken Biryani', 'Chicken Tikka', 'Chicken Korma', 'Chicken Curry']);
      expect(await mockService.getRecipes('unknown', 'Non-Veg')).toEqual(['Butter Chicken', 'Biryani', 'Chicken Curry', 'Mutton Rogan Josh', 'Fish Curry']);
      
      expect(await mockService.getRecipes('paneer, spinach', 'All')).toEqual(['Palak Paneer', 'Paneer Tikka', 'Paneer Bhurji', 'Kadai Paneer', 'Matar Paneer']);
      expect(await mockService.getRecipes('potato, cumin', 'All')).toEqual(['Aloo Jeera', 'Aloo Gobi', 'Aloo Paratha', 'Dum Aloo', 'Aloo Methi']);
      expect(await mockService.getRecipes('paneer, chicken', 'All')).toEqual(['Butter Chicken', 'Palak Paneer', 'Chicken Biryani', 'Paneer Tikka', 'Chicken Curry']);
      expect(await mockService.getRecipes('unknown', 'All')).toEqual(['Butter Chicken', 'Chana Masala', 'Biryani', 'Dal Makhani', 'Samosa']);
      expect(await mockService.getRecipes('unknown')).toEqual(['Butter Chicken', 'Chana Masala', 'Biryani', 'Dal Makhani', 'Samosa']);

      // Test getRecipeDetails
      expect(await mockService.getRecipeDetails('Palak Paneer')).toContain('Paneer, Spinach');
      expect(await mockService.getRecipeDetails('Aloo Jeera')).toContain('Potatoes, Cumin');
      expect(await mockService.getRecipeDetails('unknown')).toContain('mock unknown');
    });
  });
});

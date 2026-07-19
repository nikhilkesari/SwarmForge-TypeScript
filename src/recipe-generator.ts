import { GoogleGenAI } from '@google/genai';

export interface RecipeService {
  getRecipes(query: string): Promise<string[]>;
  getRecipeDetails(recipeName: string): Promise<string>;
}

export function parseAndValidateRecipes(text: string): string[] {
  const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJson);
  
  if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
    return parsed.slice(0, 5);
  }
  throw new Error('Invalid response structure from Gemini API');
}

export function isVegRecipe(name: string): boolean {
  const lower = name.toLowerCase();
  const nonVegKeywords = ['chicken', 'murgh', 'mutton', 'lamb', 'fish', 'prawn', 'shrimp', 'egg', 'beef', 'pork', 'meat'];
  return !nonVegKeywords.some(keyword => lower.includes(keyword));
}

export class GeminiRecipeService implements RecipeService {
  private ai: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-3.5-flash') {
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  private async generate(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
      });
      return response.text || '';
    } catch (error) {
      console.error('Gemini service error:', error);
      throw error;
    }
  }

  async getRecipes(query: string): Promise<string[]> {
    const prompt = `Generate exactly 5 authentic Indian recipe names (and only the names) that use or are related to: "${query}". Return the names as a JSON array of strings, for example: ["Aloo Jeera", "Aloo Gobi", "Aloo Paratha", "Dum Aloo", "Aloo Methi"]. Do not include backticks, markdown formatting, or any extra text.`;
    const text = await this.generate(prompt);
    return parseAndValidateRecipes(text);
  }

  async getRecipeDetails(recipeName: string): Promise<string> {
    const prompt = `Provide a brief ingredients and instructions summary for the Indian recipe "${recipeName}". Keep it concise and return only the text summary.`;
    return this.generate(prompt);
  }
}

// A mock service for testing, and as a fallback if no API key is provided
export class MockRecipeService implements RecipeService {
  async getRecipes(query: string): Promise<string[]> {
    if (query === 'paneer, spinach') {
      return ['Palak Paneer', 'Paneer Tikka', 'Paneer Bhurji', 'Kadai Paneer', 'Matar Paneer'];
    }
    if (query === 'potato, cumin') {
      return ['Aloo Jeera', 'Aloo Gobi', 'Aloo Paratha', 'Dum Aloo', 'Aloo Methi'];
    }
    if (query === 'paneer, chicken') {
      return ['Butter Chicken', 'Palak Paneer', 'Chicken Biryani', 'Paneer Tikka', 'Chicken Curry'];
    }
    // Fallback Indian recipes
    return ['Butter Chicken', 'Chana Masala', 'Biryani', 'Dal Makhani', 'Samosa'];
  }

  async getRecipeDetails(recipeName: string): Promise<string> {
    if (recipeName === 'Palak Paneer') {
      return "Ingredients: Paneer, Spinach, Spices. Instructions: Cook spinach, add paneer cubes, and simmer.";
    }
    if (recipeName === 'Aloo Jeera') {
      return "Ingredients: Potatoes, Cumin, Spices. Instructions: Boil potatoes, temper cumin, toss, and serve hot.";
    }
    return `Ingredients and instructions for mock ${recipeName}`;
  }
}

export class IndianRecipeGeneratorApp {
  private service: RecipeService;
  private container: HTMLElement;
  private currentRecipes: string[] = [];

  constructor(container: HTMLElement, service: RecipeService) {
    this.container = container;
    this.service = service;
  }

  init() {
    this.container.innerHTML = `
      <div class="app-card">
        <header>
          <h1>Indian Recipe Generator</h1>
          <p>Discover delicious authentic Indian recipes from your ingredients</p>
        </header>

        <main>
          <form id="search-form">
            <div class="input-wrapper">
              <input 
                type="text" 
                id="search-input" 
                placeholder="e.g., paneer, spinach" 
                required 
                autocomplete="off"
              />
              <button type="submit" id="submit-button">
                <span>Generate</span>
                <div class="loader" id="button-loader" style="display: none;"></div>
              </button>
            </div>
          </form>

          <div id="status-message" class="status-message" style="display: none;"></div>

          <div id="results-section" style="display: none;">
            <div class="results-header">
              <h2>Your Recipes</h2>
              <div class="filter-wrapper">
                <label for="diet-filter">Diet:</label>
                <select id="diet-filter">
                  <option value="All">All Diets</option>
                  <option value="Veg">Vegetarian</option>
                  <option value="Non-Veg">Non-Vegetarian</option>
                </select>
              </div>
            </div>
            <ul id="recipes-list"></ul>
          </div>

          <div id="recipe-details-section" class="status-message info" style="display: none; margin-top: 20px; text-align: left;">
            <h3 id="recipe-details-title" style="margin-top: 0;"></h3>
            <p id="recipe-details-content" style="margin-bottom: 0;"></p>
          </div>
        </main>
      </div>
    `;

    const form = this.container.querySelector('#search-form') as HTMLFormElement;
    const input = this.container.querySelector('#search-input') as HTMLInputElement;
    const submitBtn = this.container.querySelector('#submit-button') as HTMLButtonElement;
    const buttonLoader = this.container.querySelector('#button-loader') as HTMLElement;
    const statusMsg = this.container.querySelector('#status-message') as HTMLElement;
    const resultsSection = this.container.querySelector('#results-section') as HTMLElement;
    const recipesList = this.container.querySelector('#recipes-list') as HTMLUListElement;
    const detailsSection = this.container.querySelector('#recipe-details-section') as HTMLElement;
    const detailsTitle = this.container.querySelector('#recipe-details-title') as HTMLElement;
    const detailsContent = this.container.querySelector('#recipe-details-content') as HTMLElement;
    const dietFilter = this.container.querySelector('#diet-filter') as HTMLSelectElement;

    const renderRecipes = () => {
      recipesList.innerHTML = '';
      const filterValue = dietFilter.value;
      
      const filtered = this.currentRecipes.filter(recipe => {
        if (filterValue === 'Veg') return isVegRecipe(recipe);
        if (filterValue === 'Non-Veg') return !isVegRecipe(recipe);
        return true;
      });

      filtered.forEach((recipe, idx) => {
        const li = document.createElement('li');
        li.className = 'recipe-item';
        li.style.animationDelay = `${idx * 0.1}s`;
        li.innerHTML = `
          <span class="recipe-num">0${idx + 1}</span>
          <span class="recipe-name">${recipe}</span>
          <button class="get-recipe-btn" data-recipe="${recipe}">Get Recipe</button>
        `;
        recipesList.appendChild(li);
      });

      // Add event listeners to the buttons
      const buttons = recipesList.querySelectorAll('.get-recipe-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const recipeName = (e.currentTarget as HTMLButtonElement).getAttribute('data-recipe') || '';
          detailsTitle.textContent = `${recipeName} Details`;
          detailsContent.textContent = 'Fetching recipe instructions...';
          detailsSection.style.display = 'block';

          try {
            const details = await this.service.getRecipeDetails(recipeName);
            detailsContent.textContent = details;
          } catch (err) {
            detailsContent.textContent = 'Failed to load recipe details. Please try again.';
          }
        });
      });
    };

    dietFilter.addEventListener('change', () => {
      renderRecipes();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;

      // Loading state
      submitBtn.disabled = true;
      buttonLoader.style.display = 'inline-block';
      statusMsg.style.display = 'block';
      statusMsg.className = 'status-message info';
      statusMsg.textContent = 'Consulting the culinary oracle...';
      resultsSection.style.display = 'none';
      recipesList.innerHTML = '';
      detailsSection.style.display = 'none';

      try {
        this.currentRecipes = await this.service.getRecipes(query);
        dietFilter.value = 'All'; // Reset filter on new search
        
        statusMsg.style.display = 'none';
        resultsSection.style.display = 'block';
        
        renderRecipes();
      } catch (error) {
        statusMsg.className = 'status-message error';
        statusMsg.textContent = 'Oops! Failed to retrieve recipes. Please try again.';
      } finally {
        submitBtn.disabled = false;
        buttonLoader.style.display = 'none';
      }
    });
  }
}

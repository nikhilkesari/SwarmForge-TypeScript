import { GoogleGenAI } from '@google/genai';

export interface RecipeService {
  getRecipes(query: string): Promise<string[]>;
}

export class GeminiRecipeService implements RecipeService {
  private ai: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.0-flash') {
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async getRecipes(query: string): Promise<string[]> {
    const prompt = `Generate exactly 5 authentic Indian recipe names (and only the names) that use or are related to: "${query}". Return the names as a JSON array of strings, for example: ["Aloo Jeera", "Aloo Gobi", "Aloo Paratha", "Dum Aloo", "Aloo Methi"]. Do not include backticks, markdown formatting, or any extra text.`;
    
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt,
      });

      const text = response.text || '';
      // Strip markdown code blocks if returned
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
        return parsed.slice(0, 5);
      }
      throw new Error('Invalid response structure from Gemini API');
    } catch (error) {
      console.error('Gemini service error:', error);
      throw error;
    }
  }
}

// A mock service for testing, and as a fallback if no API key is provided
export class MockRecipeService implements RecipeService {
  async getRecipes(query: string): Promise<string[]> {
    const lower = query.toLowerCase();
    if (lower.includes('paneer') || lower.includes('spinach')) {
      return ['Palak Paneer', 'Paneer Tikka', 'Paneer Bhurji', 'Kadai Paneer', 'Matar Paneer'];
    }
    if (lower.includes('potato') || lower.includes('cumin')) {
      return ['Aloo Jeera', 'Aloo Gobi', 'Aloo Paratha', 'Dum Aloo', 'Aloo Methi'];
    }
    // Fallback Indian recipes
    return ['Butter Chicken', 'Chana Masala', 'Biryani', 'Dal Makhani', 'Samosa'];
  }
}

export class IndianRecipeGeneratorApp {
  private service: RecipeService;
  private container: HTMLElement;

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
            <h2>Your Recipes</h2>
            <ul id="recipes-list"></ul>
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

      try {
        const recipes = await this.service.getRecipes(query);
        
        statusMsg.style.display = 'none';
        resultsSection.style.display = 'block';
        
        recipes.forEach((recipe, idx) => {
          const li = document.createElement('li');
          li.className = 'recipe-item';
          li.style.animationDelay = `${idx * 0.1}s`;
          li.innerHTML = `
            <span class="recipe-num">0${idx + 1}</span>
            <span class="recipe-name">${recipe}</span>
          `;
          recipesList.appendChild(li);
        });
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

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

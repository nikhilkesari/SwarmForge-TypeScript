import { GoogleGenAI } from '@google/genai';

export interface RecipeService {
  getRecipes(query: string, diet?: string): Promise<string[]>;
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

  async getRecipes(query: string, diet?: string): Promise<string[]> {
    let dietDescription = '';
    if (diet === 'Veg') {
      dietDescription = ' vegetarian';
    } else if (diet === 'Non-Veg') {
      dietDescription = ' non-vegetarian';
    }
    const prompt = `Generate exactly 5 authentic Indian${dietDescription} recipe names (and only the names) that use or are related to: "${query}". Return the names as a JSON array of strings, for example: ["Aloo Jeera", "Aloo Gobi", "Aloo Paratha", "Dum Aloo", "Aloo Methi"]. Do not include backticks, markdown formatting, or any extra text.`;
    const text = await this.generate(prompt);
    return parseAndValidateRecipes(text);
  }

  async getRecipeDetails(recipeName: string): Promise<string> {
    const prompt = `Provide a brief ingredients and instructions summary for the Indian recipe "${recipeName}". Keep it concise and return only the text summary.`;
    return this.generate(prompt);
  }
}



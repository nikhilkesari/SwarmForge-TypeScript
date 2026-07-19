import { RecipeService } from './recipe-service';

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

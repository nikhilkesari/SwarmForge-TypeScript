import { RecipeService } from './recipe-service';

const MOCK_RECIPES: Record<string, string[]> = {
  'Veg:paneer, spinach': ['Palak Paneer', 'Paneer Tikka', 'Paneer Bhurji', 'Kadai Paneer', 'Matar Paneer'],
  'Veg:paneer, chicken': ['Palak Paneer', 'Paneer Tikka', 'Paneer Bhurji', 'Kadai Paneer', 'Matar Paneer'],
  'Veg:chicken': [],
  'Veg:default': ['Chana Masala', 'Dal Makhani', 'Samosa', 'Aloo Gobi', 'Aloo Jeera'],
  'Non-Veg:chicken': ['Butter Chicken', 'Chicken Biryani', 'Chicken Tikka', 'Chicken Korma', 'Chicken Curry'],
  'Non-Veg:paneer, chicken': ['Butter Chicken', 'Chicken Biryani', 'Chicken Tikka', 'Chicken Korma', 'Chicken Curry'],
  'Non-Veg:potato, cumin': [],
  'Non-Veg:default': ['Butter Chicken', 'Biryani', 'Chicken Curry', 'Mutton Rogan Josh', 'Fish Curry'],
  'All:paneer, spinach': ['Palak Paneer', 'Paneer Tikka', 'Paneer Bhurji', 'Kadai Paneer', 'Matar Paneer'],
  'All:potato, cumin': ['Aloo Jeera', 'Aloo Gobi', 'Aloo Paratha', 'Dum Aloo', 'Aloo Methi'],
  'All:paneer, chicken': ['Butter Chicken', 'Palak Paneer', 'Chicken Biryani', 'Paneer Tikka', 'Chicken Curry'],
  'All:default': ['Butter Chicken', 'Chana Masala', 'Biryani', 'Dal Makhani', 'Samosa']
};

// A mock service for testing, and as a fallback if no API key is provided
export class MockRecipeService implements RecipeService {
  async getRecipes(query: string, diet: string = 'All'): Promise<string[]> {
    const key = `${diet}:${query}`;
    if (key in MOCK_RECIPES) {
      return MOCK_RECIPES[key];
    }
    const defaultKey = `${diet}:default`;
    return MOCK_RECIPES[defaultKey] || MOCK_RECIPES['All:default'];
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

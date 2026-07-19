import './index.css';
import { IndianRecipeGeneratorApp, GeminiRecipeService, MockRecipeService } from './recipe-generator';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('GEMINI_API_KEY');
const model = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.5-flash';

const urlParams = new URLSearchParams(window.location.search);
const useMock = urlParams.get('mock') === 'true';

const container = document.getElementById('app');
if (container) {
  const service = (apiKey && !useMock) ? new GeminiRecipeService(apiKey, model) : new MockRecipeService();
  const app = new IndianRecipeGeneratorApp(container, service);
  app.init();
}

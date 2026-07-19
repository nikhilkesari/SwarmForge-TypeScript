import { RecipeService, isVegRecipe } from './recipe-service';

export class IndianRecipeGeneratorApp {
  private service: RecipeService;
  private container: HTMLElement;
  private currentRecipes: string[] = [];
  private currentFilter = 'All';

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

          <div class="diet-toggle-container">
            <button type="button" class="diet-toggle-btn active" data-diet="All">All</button>
            <button type="button" class="diet-toggle-btn" data-diet="Veg">Veg Only</button>
            <button type="button" class="diet-toggle-btn" data-diet="Non-Veg">Non-Veg Only</button>
          </div>

          <div id="status-message" class="status-message" style="display: none;"></div>

          <div id="results-section" style="display: none;">
            <div class="results-header">
              <h2>Your Recipes</h2>
            </div>
            <ul id="recipes-list"></ul>
            <div id="filter-empty-message" class="status-message info" style="display: none;"></div>
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
    const toggleBtns = this.container.querySelectorAll('.diet-toggle-btn');
    const filterEmptyMsg = this.container.querySelector('#filter-empty-message') as HTMLElement;

    const renderRecipes = () => {
      recipesList.innerHTML = '';
      filterEmptyMsg.style.display = 'none';
      filterEmptyMsg.textContent = '';
      
      const filtered = this.currentRecipes.filter(recipe => {
        if (this.currentFilter === 'Veg') return isVegRecipe(recipe);
        if (this.currentFilter === 'Non-Veg') return !isVegRecipe(recipe);
        return true;
      });

      if (filtered.length === 0) {
        const displayFilter = this.currentFilter === 'All' ? 'All' : `${this.currentFilter} Only`;
        filterEmptyMsg.textContent = `No recipes matching ${displayFilter} found.`;
        filterEmptyMsg.style.display = 'block';
      }

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

    const handleFetch = async () => {
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
        this.currentRecipes = await this.service.getRecipes(query, this.currentFilter);
        this.lastSubmittedQuery = query;
        
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
    };

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        const target = e.currentTarget as HTMLButtonElement;
        target.classList.add('active');
        this.currentFilter = target.getAttribute('data-diet') || 'All';
        const query = input.value.trim();

        if (query) {
          await handleFetch();
        } else {
          renderRecipes();
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleFetch();
    });
  }

  private lastSubmittedQuery = '';
}
